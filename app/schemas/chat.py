from pydantic import BaseModel

from datetime import datetime





class MessageBase(BaseModel):

    content: str

    receiver_id: int

    listing_id: int | None = None





class MessageCreate(MessageBase):

    pass





class MessageResponse(MessageBase):

    id: int

    sender_id: int

    created_at: datetime

    is_read: bool



    class Config:

        from_attributes = True

