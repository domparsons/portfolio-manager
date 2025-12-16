import base64

import jwt
import requests
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers

from app.core.auth.config import Auth0Config


class JWTValidator:
    def __init__(self, config: Auth0Config):
        self.config = config
        self._jwks = None

    def get_jwks(self):
        """Fetch Auth0's public keys (JWKS)"""
        if self._jwks:
            return self._jwks

        jwks_url = f"https://{self.config.domain}/.well-known/jwks.json"
        response = requests.get(jwks_url)
        response.raise_for_status()

        self._jwks = response.json()
        return self._jwks

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
