from pydantic import BaseModel, EmailStr

from datetime import datetime





                   

class UserBase(BaseModel):

    username: str

    email: EmailStr





                                                        

class UserCreate(UserBase):

    password: str





                                                                            

class UserResponse(BaseModel):

    id: int

    username: str

    email: str

    is_admin: bool

    profile_image: str | None = None

    created_at: datetime



    class Config:

        from_attributes = True                                                      

