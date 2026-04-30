import os

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

from app.core.config import settings

from app.db.database import engine, Base

from app.models import user, listing, image                                          



                    

from app.api.endpoints import users, auth, listings, chat                        



app = FastAPI(

    title=settings.PROJECT_NAME,

    version=settings.VERSION,

    openapi_url=f"{settings.API_V1_STR}/openapi.json",

)



                                                   

os.makedirs("uploads/images", exist_ok=True)

app.mount("/static", StaticFiles(directory="uploads"), name="static")



                                                                         

app.add_middleware(

    CORSMiddleware,

    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)





@app.get("/")

def root():

    return {"message": "Welcome to the Marketplace API. Monolith is online."}





                      

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

app.include_router(users.router, prefix="/api/users", tags=["Users"])

app.include_router(listings.router, prefix="/api/listings", tags=["Listings"])

app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

