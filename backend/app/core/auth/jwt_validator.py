import base64
import threading
import time

import jwt
import requests
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers

from app.core.auth.config import Auth0Config
from app.logger import logger

_jwks_cache: dict | None = None
_jwks_cache_lock = threading.Lock()
_jwks_cache_fetched_at: float = 0.0
_JWKS_CACHE_TTL_SECONDS = 60 * 60 * 12  # 12 hours


class JWTValidator:
    def __init__(self, config: Auth0Config):
        self.config = config

    def get_jwks(self):
        """Fetch Auth0's public keys (JWKS), using a module-level cache."""
        global _jwks_cache, _jwks_cache_fetched_at

        now = time.monotonic()

        # Fast path: cache is warm and not expired — no lock needed for reads.
        if (
            _jwks_cache is not None
            and (now - _jwks_cache_fetched_at) < _JWKS_CACHE_TTL_SECONDS
        ):
            return _jwks_cache

        with _jwks_cache_lock:
            # Re-check inside the lock in case another thread just populated it.
            now = time.monotonic()
            if (
                _jwks_cache is not None
                and (now - _jwks_cache_fetched_at) < _JWKS_CACHE_TTL_SECONDS
            ):
                return _jwks_cache

            jwks_url = f"https://{self.config.domain}/.well-known/jwks.json"
            logger.info("Fetching JWKS from Auth0 (cache miss or expired)")
            response = requests.get(jwks_url, timeout=10)
            response.raise_for_status()

            _jwks_cache = response.json()
            _jwks_cache_fetched_at = time.monotonic()

        return _jwks_cache

    def get_signing_key(self, token: str):
        """Extract the public key for this specific token"""
        try:
            header = jwt.get_unverified_header(token)
            kid = header.get("kid")
        except Exception as e:
            raise jwt.InvalidTokenError(f"Failed to decode token header: {str(e)}")

        if not kid:
            raise jwt.InvalidTokenError(
                f"Token missing 'kid' in header. Header: {header}"
            )

        jwks = self.get_jwks()

        for key_data in jwks.get("keys", []):
            if key_data.get("kid") == kid:
                # Convert JWK to PEM format for PyJWT
                return self._jwk_to_pem(key_data)

        raise jwt.InvalidTokenError(f"Unable to find signing key with kid: {kid}")

    def _jwk_to_pem(self, jwk: dict) -> bytes:
        """Convert JWK to PEM format"""
        n = self._base64_to_int(jwk["n"])
        e = self._base64_to_int(jwk["e"])

        public_numbers = RSAPublicNumbers(e, n)
        public_key = public_numbers.public_key(default_backend())

        pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        return pem

    def _base64_to_int(self, value: str) -> int:
        """Convert base64url-encoded value to integer"""
        padding = 4 - (len(value) % 4)
        if padding != 4:
            value += "=" * padding

        decoded = base64.urlsafe_b64decode(value)
        return int.from_bytes(decoded, byteorder="big")

    def validate_token(self, token: str) -> dict:
        """
        Validates JWT and returns payload
        Raises: jwt.InvalidTokenError if invalid
        """
        try:
            signing_key = self.get_signing_key(token)

            payload = jwt.decode(
                token,
                signing_key,
                algorithms=list(self.config.algorithms),
                audience=self.config.api_audience,
                issuer=f"https://{self.config.domain}/",
            )

            return payload

        except jwt.ExpiredSignatureError:
            raise jwt.InvalidTokenError("Token has expired")
        except jwt.InvalidAudienceError:
            raise jwt.InvalidTokenError("Invalid audience")
        except jwt.InvalidIssuerError:
            raise jwt.InvalidTokenError("Invalid issuer")
        except jwt.InvalidTokenError as e:
            raise jwt.InvalidTokenError(f"Invalid token: {str(e)}")
        except Exception as e:
            raise jwt.InvalidTokenError(f"Token validation failed: {str(e)}")
