from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ListingBase(BaseModel):
    title: str
    description: str
    price: float
    category: str
    location: str


# Schema for an individual image
class ImageResponse(BaseModel):
    id: int
    filename: str

    class Config:
        from_attributes = True


# Expected payload when creating a listing
class ListingCreate(ListingBase):
    pass


from app.schemas.user import UserResponse

# What we send back to the user
class ListingResponse(ListingBase):
    id: int
    is_active: bool
    created_at: datetime
    owner: UserResponse
    images: list[ImageResponse] = []

    class Config:
        from_attributes = True
