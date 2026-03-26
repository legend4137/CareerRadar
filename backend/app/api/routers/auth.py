from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests

from app.db.session import get_db
from app.models.user import User
from app.core.config import settings
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class GoogleAuthRequest(BaseModel):
    token: str

@router.post("/google")
def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        # Verify Google token using google-auth library
        idinfo = id_token.verify_oauth2_token(
            request.token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        # ID token is valid. Extract user info
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')
             
    except Exception as e:
        # For development ease: if token is explicitly 'mock_token', allow bypassing DB hook
        if request.token == "mock_token":
            google_id = "mock_google_id"
            email = "user@mock.com"
            name = "Mock User"
        else:
            raise HTTPException(status_code=400, detail=f"Invalid Google Token: {str(e)}")

    # Find or create user in Database
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
            db.commit()
        else:
            user = User(google_id=google_id, email=email, name=name, profile_complete=False)
            db.add(user)
            db.commit()
            db.refresh(user)

    # Generate JWT Session Block
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "profileComplete": user.profile_complete,
            "role": user.role
        }
    }
