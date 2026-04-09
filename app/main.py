import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.database import engine, Base
from app.models import user, listing, image  # Import to ensure Base knows about them

# Import the routers
from app.api.endpoints import users, auth, listings, chat  # <--- Added chat here

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Ensure the upload directory exists, then mount it
os.makedirs("uploads/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# CORS configuration - allows your React app to communicate with this API
origins = [
    "http://localhost:3000",  # Default React/Create React App port
    "http://localhost:5173",  # Default Vite/React port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Welcome to the Marketplace API. Monolith is online."}


# Register the routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(listings.router, prefix="/api/listings", tags=["Listings"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
