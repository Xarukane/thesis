import os

import shutil

import uuid

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from sqlalchemy.orm import Session

from sqlalchemy import or_



from app.db.database import get_db

from app.models.listing import Listing

from app.models.user import User

from app.models.image import Image

from app.schemas.listing import ListingCreate, ListingResponse, ImageResponse

from app.api.deps import get_current_user



router = APIRouter()



                                                                         

UPLOAD_DIR = "uploads/images"

os.makedirs(UPLOAD_DIR, exist_ok=True)





@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)

def create_listing(

    listing: ListingCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(

        get_current_user

    ),                                        

):

                                                            

                                                                         

    new_listing = Listing(**listing.model_dump(), owner_id=current_user.id)

    db.add(new_listing)

    db.commit()

    db.refresh(new_listing)

    return new_listing





@router.get("/", response_model=List[ListingResponse])

def get_all_listings(

    skip: int = 0,

    limit: int = 100,

    category: Optional[str] = None,

    location: Optional[str] = None,

    min_price: Optional[float] = None,

    max_price: Optional[float] = None,

    search: Optional[str] = None,

    db: Session = Depends(get_db),

):

                                                                                  

    query = db.query(Listing).filter(Listing.is_active == True)



    if category:

        query = query.filter(Listing.category == category)

    if location:

        query = query.filter(Listing.location.ilike(f"%{location}%"))

    if min_price is not None:

        query = query.filter(Listing.price >= min_price)

    if max_price is not None:

        query = query.filter(Listing.price <= max_price)

    if search:

        query = query.filter(

            or_(

                Listing.title.ilike(f"%{search}%"),

                Listing.description.ilike(f"%{search}%"),

            )

        )



    listings = query.offset(skip).limit(limit).all()

    return listings





@router.post(

    "/{listing_id}/images",

    response_model=ImageResponse,

    status_code=status.HTTP_201_CREATED,

)

def upload_listing_image(

    listing_id: int,

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user),

):

                                                                    

                                                 

    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:

        raise HTTPException(status_code=404, detail="Listing not found")

    if int(listing.owner_id) != current_user.id:

        raise HTTPException(

            status_code=403, detail="Not authorized to add images to this listing"

        )



                                   

    file_extension = file.filename.split(".")[-1] if file.filename else "jpg"

    unique_filename = f"{uuid.uuid4()}.{file_extension}"

    file_path = os.path.join(UPLOAD_DIR, unique_filename)



                                        

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(file.file, buffer)



                                        

    new_image = Image(filename=unique_filename, listing_id=listing.id)

    db.add(new_image)

    db.commit()

    db.refresh(new_image)



    return new_image





@router.get("/{listing_id}", response_model=ListingResponse)

def get_listing(listing_id: int, db: Session = Depends(get_db)):

                                                                 

    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found"

        )

    return listing





@router.put("/{listing_id}", response_model=ListingResponse)

def update_listing(

    listing_id: int,

    listing_update: ListingCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user),

):

                                                                             

    listing = db.query(Listing).filter(Listing.id == listing_id).first()



    if not listing:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found"

        )



                                                                  

    if listing.owner_id != current_user.id and not current_user.is_admin:

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN,

            detail="Not authorized to update this listing",

        )



                       

    for key, value in listing_update.model_dump().items():

        setattr(listing, key, value)



    db.commit()

    db.refresh(listing)

    return listing





@router.delete("/{listing_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)

def delete_listing_image(

    listing_id: int,

    image_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user),

):

                                                                             

                                

    listing = db.query(Listing).filter(Listing.id == listing_id).first()

    if not listing:

        raise HTTPException(status_code=404, detail="Listing not found")

    

                            

    if listing.owner_id != current_user.id and not current_user.is_admin:

        raise HTTPException(status_code=403, detail="Not authorized")



                                                          

    image = db.query(Image).filter(Image.id == image_id, Image.listing_id == listing_id).first()

    if not image:

        raise HTTPException(status_code=404, detail="Image not found")



                                                            

    file_path = os.path.join(UPLOAD_DIR, image.filename)

    if os.path.exists(file_path):

        os.remove(file_path)



                       

    db.delete(image)

    db.commit()

    return None





@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)

def delete_listing(

    listing_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user),

):

                                                                             

    listing = db.query(Listing).filter(Listing.id == listing_id).first()



    if not listing:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found"

        )



                                                                  

    if listing.owner_id != current_user.id and not current_user.is_admin:

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN,

            detail="Not authorized to delete this listing",

        )



                                             

    for image in listing.images:

        file_path = os.path.join(UPLOAD_DIR, image.filename)

        if os.path.exists(file_path):

            os.remove(file_path)



    db.delete(listing)

    db.commit()

    return None

