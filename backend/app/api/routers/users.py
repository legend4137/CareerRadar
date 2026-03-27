import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

UPLOAD_DIR = "uploads/resumes"

# Ensure upload dir exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "job_description": current_user.job_description,
        "resume_filepath": current_user.resume_filepath,
        "profileComplete": current_user.profile_complete,
    }

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
        file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{resume.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        current_user.resume_filepath = file_path
        
    # Mark profile complete 
    if current_user.role:
        current_user.profile_complete = True
        
    db.commit()
    db.refresh(current_user)
    
    return {"status": "success", "profileComplete": current_user.profile_complete}
