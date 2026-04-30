from sqlalchemy import create_engine

from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings



                                                                                

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.sqlalchemy_database_url, connect_args=connect_args)



SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



Base = declarative_base()





                                                           

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()

