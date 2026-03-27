import os
import shutil
from pydantic import BaseModel
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, NormalUser
from app.models.preference import UserPreference
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

UPLOAD_DIR = "uploads/resumes"

# Ensure upload dir exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PreferenceUpdate(BaseModel):
    job_roles: List[str]
    locations: List[str]
    why_hire_me: str

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    prefs = current_user.preferences
    
    # Common fields
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "job_description": current_user.job_description,
        "resume_filepath": current_user.resume_filepath,
        "profileComplete": current_user.profile_complete,
        "preferences": {
            "job_roles": prefs.job_roles if prefs else [],
            "locations": prefs.locations if prefs else [],
            "why_hire_me": prefs.why_hire_me if prefs else ""
        } if prefs else None
    }
    
    return user_data

@router.put("/profile")
def update_profile(
    role: str = Form(None),
    job_description: str = Form(None),
    resume: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if role is not None:
        current_user.role = role
    
    if job_description is not None:
        current_user.job_description = job_description
        
    if resume and resume.filename:
        # Save file to disk securely
        file_path = os.path.join(UPLOAD_DIR, f"{'normal' if isinstance(current_user, NormalUser) else 'google'}_{current_user.id}_{resume.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        current_user.resume_filepath = file_path
        
    # Mark profile complete 
    if current_user.role:
        current_user.profile_complete = True
        
    db.commit()
    db.refresh(current_user)
    
    return {"status": "success", "profileComplete": current_user.profile_complete}

@router.put("/preferences")
def update_preferences(
    prefs: PreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if isinstance(current_user, User):
        user_prefs = db.query(UserPreference).filter(UserPreference.google_user_id == current_user.id).first()
        if not user_prefs:
            user_prefs = UserPreference(google_user_id=current_user.id)
            db.add(user_prefs)
    else:
        user_prefs = db.query(UserPreference).filter(UserPreference.normal_user_id == current_user.id).first()
        if not user_prefs:
            user_prefs = UserPreference(normal_user_id=current_user.id)
            db.add(user_prefs)
    
    user_prefs.job_roles = prefs.job_roles
    user_prefs.locations = prefs.locations
    user_prefs.why_hire_me = prefs.why_hire_me
    
    # Also update profile_complete if everything is filled
    if prefs.job_roles and prefs.locations and prefs.why_hire_me:
        current_user.profile_complete = True
        
    db.commit()
    return {"status": "success", "profileComplete": current_user.profile_complete}
