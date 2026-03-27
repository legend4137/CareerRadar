import os
from dotenv import load_dotenv

# Automatically load variables from the .env file
load_dotenv()

class Settings:
    PROJECT_NAME = 'CareerRadar'
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback-dev-secret-key-only")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

    # Production Google Client ID MUST come from environment
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

settings = Settings()
