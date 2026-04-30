import sys
from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin(username, email, password):
    db = SessionLocal()
    try:
        # Check if user already exists
        user = db.query(User).filter((User.email == email) | (User.username == username)).first()
        if user:
            print(f"User {username} or email {email} already exists.")
            return

        hashed_password = get_password_hash(password)
        admin_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        print(f"Admin user {username} created successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_admin.py <username> <email> <password>")
    else:
        create_admin(sys.argv[1], sys.argv[2], sys.argv[3])
