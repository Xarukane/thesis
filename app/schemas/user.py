from pydantic import BaseModel, EmailStr
from datetime import datetime


# Shared properties
class UserBase(BaseModel):
    username: str
    email: EmailStr


# What we expect from the frontend when a user registers
class UserCreate(UserBase):
    password: str


# What we send back to the frontend (notice we NEVER send the password back)
class UserResponse(BaseModel):
    id: int
    username: str
    is_admin: bool
    profile_image: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True  # Tells Pydantic to read data from SQLAlchemy models
