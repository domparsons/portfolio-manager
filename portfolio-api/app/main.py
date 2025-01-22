from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.config.settings import settings
from app.api.endpoints import user, watchlist, auth, asset
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer


app = FastAPI(title="Portfolio Manager")

# CORS settings
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.openapi_schema = None
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(user.router)
app.include_router(watchlist.router)
app.include_router(auth.router)
app.include_router(asset.router)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


# A simple user model to simulate user data
class UserCreate(BaseModel):
    username: str
    password: str


# Custom OpenAPI schema configuration to define the security definitions
@app.get("/openapi.json")
async def custom_openapi():
    openapi_schema = app.openapi()
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization",
            "description": "Enter the token with the `Bearer: ` prefix, e.g. `Bearer abcde12345`",
        }
    }
    openapi_schema["security"] = [{"Bearer": []}]
    return openapi_schema


# Define a simple protected route that requires Bearer token
@app.get("/protected")
def protected_route(token: str = Depends(oauth2_scheme)):
    return {"message": "You have access!", "token": token}
