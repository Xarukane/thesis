from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.listing import Listing


class Image(Base):
    __tablename__ = "images"

    # Using the modern SQLAlchemy 2.0 syntax so Pylance stays happy!
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(String, index=True)

    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"))

    # The relationship back to the listing
    listing: Mapped["Listing"] = relationship(back_populates="images")
