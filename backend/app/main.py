from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.routers import auth, jobs, remotive_jobs, arbeitnow_jobs, jobicy_jobs, users
from app.db.session import engine, Base
from app.models.user import User, NormalUser
from app.models.preference import UserPreference

# Ensure upload directory exists before mounting
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/resumes", exist_ok=True)

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title='CareerRadar API')

# Add CORS Middleware to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://careerradar-oh6qnmmnl-legend4137s-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(jobs.router, prefix="/api/jobs")
app.include_router(remotive_jobs.router, prefix="/api/remotive-jobs")
app.include_router(arbeitnow_jobs.router, prefix="/api/arbeitnow-jobs")
app.include_router(jobicy_jobs.router, prefix="/api/jobicy-jobs")

# Mount Static Files for Resumes
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get('/')
def read_root():
    return {'message': 'Welcome to CareerRadar API'}
