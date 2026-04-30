import os

import shutil

import uuid

from typing import List

from app.api.deps import get_current_user

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.user import User

from app.models.listing import Listing

from app.schemas.user import UserCreate, UserResponse

from app.schemas.listing import ListingResponse

from app.core.security import get_password_hash



router = APIRouter()



UPLOAD_DIR = "uploads/images"

os.makedirs(UPLOAD_DIR, exist_ok=True)





@router.post(

    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED

)

def register_user(user: UserCreate, db: Session = Depends(get_db)):

                                                        

    existing_user = (

        db.query(User)

        .filter((User.email == user.email) | (User.username == user.username))

        .first()

    )



    if existing_user:

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail="Email or username already registered.",

        )



                          

    hashed_pwd = get_password_hash(user.password)



                                            

    new_user = User(

        username=user.username, email=user.email, hashed_password=hashed_pwd

    )



                             

    db.add(new_user)

    db.commit()

    db.refresh(new_user)                                                      



    return new_user





@router.get("/me", response_model=UserResponse)

def read_user_profile(current_user: User = Depends(get_current_user)):

    


       

    return current_user





@router.post("/me/image", response_model=UserResponse)

def upload_profile_image(

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user),

):

                                                                    

                                   

    file_extension = file.filename.split(".")[-1] if file.filename else "jpg"

    unique_filename = f"profile_{uuid.uuid4()}.{file_extension}"

    file_path = os.path.join(UPLOAD_DIR, unique_filename)



                      

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(file.file, buffer)



                               

    current_user.profile_image = unique_filename

    db.add(current_user)

    db.commit()

    db.refresh(current_user)



    return current_user





@router.get("/me/listings", response_model=List[ListingResponse])

def read_user_listings(

    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)

):

                                                                       

    return db.query(Listing).filter(Listing.owner_id == current_user.id).all()





@router.get("/", response_model=List[UserResponse])

def get_all_users(

    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)

):

                                            

    if not current_user.is_admin:

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"

        )

    return db.query(User).all()





@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)

def delete_user(

    user_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user),

):

                                          

    if not current_user.is_admin:

        raise HTTPException(

            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"

        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:

        raise HTTPException(status_code=404, detail="User not found")

    

                                                       

    for listing in user.listings:

        for image in listing.images:

            file_path = os.path.join(UPLOAD_DIR, image.filename)

            if os.path.exists(file_path):

                os.remove(file_path)



    db.delete(user)

    db.commit()

    return None





@router.get("/{user_id}", response_model=UserResponse)

def read_user_by_id(user_id: int, db: Session = Depends(get_db)):

                                                    

    user = db.query(User).filter(User.id == user_id).first()

    if not user:

        raise HTTPException(status_code=404, detail="User not found")

    return user





@router.get("/{user_id}/listings", response_model=List[ListingResponse])

def read_public_user_listings(user_id: int, db: Session = Depends(get_db)):

                                                        

    return (

        db.query(Listing)

        .filter(Listing.owner_id == user_id, Listing.is_active == True)

        .all()

    )

