from pydantic_settings import BaseSettings





class Settings(BaseSettings):

    PROJECT_NAME: str = "Marketplace API"

    VERSION: str = "1.0.0"

    API_V1_STR: str = "/api/v1"



                                                     

                                                               

    DATABASE_URL: str = "sqlite:///./marketplace.db"



                                                                   

    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION"

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30



    class Config:

        case_sensitive = True





settings = Settings()

