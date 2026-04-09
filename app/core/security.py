import bcrypt
from datetime import datetime, timedelta, timezone
import jwt
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a plain text password matches the hashed one in the database."""
    password_bytes = plain_password.encode("utf-8")
    hashed_password_bytes = hashed_password.encode("utf-8")

    return bcrypt.checkpw(password_bytes, hashed_password_bytes)


def get_password_hash(password: str) -> str:
    """Takes a plain text password and returns a securely hashed version."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()

    hashed_password_bytes = bcrypt.hashpw(pwd_bytes, salt)

    # Decode back to a string so it can be saved in our database safely
    return hashed_password_bytes.decode("utf-8")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Generates a JSON Web Token (JWT) with an expiration time."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    # Create the JWT using your secret key and algorithm from config.py
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt
