import pytest

from fastapi.testclient import TestClient

from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker

from sqlalchemy.pool import StaticPool



from app.main import app

from app.db.database import Base, get_db



SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"



engine = create_engine(

    SQLALCHEMY_DATABASE_URL,

    connect_args={"check_same_thread": False},

    poolclass=StaticPool,

)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



@pytest.fixture(scope="function")

def db():

    Base.metadata.create_all(bind=engine)

    db_session = TestingSessionLocal()

    try:

        yield db_session

    finally:

        db_session.close()

        Base.metadata.drop_all(bind=engine)



@pytest.fixture(scope="function")

def client(db):

    def override_get_db():

        try:

            yield db

        finally:

            pass

    

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:

        yield c

    app.dependency_overrides.clear()



@pytest.fixture(scope="function")

def test_user(client):

    response = client.post("/api/users/register", json={

        "username": "testuser",

        "email": "test@example.com",

        "password": "testpassword"

    })

    return response.json()



@pytest.fixture(scope="function")

def auth_headers(client, test_user):

    response = client.post("/api/auth/login", data={

        "username": "testuser",

        "password": "testpassword"

    })

    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}



@pytest.fixture(scope="function")

def admin_user(db, client):

                     

    client.post("/api/users/register", json={

        "username": "adminuser",

        "email": "admin@example.com",

        "password": "adminpassword"

    })

                                        

    from app.models.user import User

    user = db.query(User).filter(User.username == "adminuser").first()

    user.is_admin = True

    db.commit()

    db.refresh(user)

    

                                                        

    return {

        "id": user.id,

        "username": user.username,

        "email": user.email,

        "is_admin": True

    }



@pytest.fixture(scope="function")

def admin_auth_headers(client, admin_user):

    response = client.post("/api/auth/login", data={

        "username": "adminuser",

        "password": "adminpassword"

    })

    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}

