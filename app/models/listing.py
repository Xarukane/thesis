from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from app.db.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.image import Image


class Listing(Base):
    __tablename__ = "listings"

    # Using Mapped[] tells Pylance exactly what Python type to expect at runtime
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String)
    price: Mapped[float] = mapped_column(Float)
    category: Mapped[str] = mapped_column(String, index=True)
    location: Mapped[str] = mapped_column(String, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # The string "User" prevents circular import errors
    owner: Mapped["User"] = relationship("User", back_populates="listings")

    # Cascade means if the listing is deleted, its database image records are deleted too
    images: Mapped[list["Image"]] = relationship(
        "Image", back_populates="listing", cascade="all, delete-orphan"
    )
