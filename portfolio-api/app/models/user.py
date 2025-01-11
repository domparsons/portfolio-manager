from sqlalchemy import Column, Integer, String
from app.database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    # Method to hash the password before saving
    def set_password(self, password: str):
        self.password = pwd_context.hash(password)

    # Method to verify if a given password matches the hashed one
    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password)

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
