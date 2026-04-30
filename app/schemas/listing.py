from pydantic import BaseModel

from datetime import datetime

from typing import Optional





class ListingBase(BaseModel):

    title: str

    description: str

    price: float

    category: str

    location: str





                                

class ImageResponse(BaseModel):

    id: int

    filename: str



    class Config:

        from_attributes = True





                                          

class ListingCreate(ListingBase):

    pass





from app.schemas.user import UserResponse



                               

class ListingResponse(ListingBase):

    id: int

    is_active: bool

    created_at: datetime

    owner: UserResponse

    images: list[ImageResponse] = []



    class Config:

        from_attributes = True

