import os

class Settings:
    PROJECT_NAME = 'CareerRadar'
    SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "908553415672-91ubhsl446upi2g5adumfacade7uh4fj.apps.googleusercontent.com")

settings = Settings()
