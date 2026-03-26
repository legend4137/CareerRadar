# CareerRadar 🎯

An AI-powered Opportunity Radar that helps college students find the perfect internships, hackathons, research programs, and competitions tailored exactly to their skills and resume.

## Features
- **Smart Onboarding:** Tell us your field and upload your resume.
- **AI Matching (Coming Soon):** We use AI to extract your skills and calculate a unique "Fit Score" against thousands of opportunities.
- **Modern Dashboard:** Track your career matches and never miss a deadline.
- **Secure Authentication:** Single Sign-On with Google OAuth.

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows:
   python -m venv venv
   venv\Scripts\activate
   
   # Mac/Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set your Google Client ID in `backend/app/core/config.py`.
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will be available at `http://127.0.0.1:8000`.*

### 2. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Set your Google Client ID in `frontend/src/main.jsx`.
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

---

## Tech Stack
- **Frontend:** React.js, Vite, React Router, Context API, Vanilla CSS (Glassmorphism design)
- **Backend:** FastAPI, SQLite (Dev) / PostgreSQL (Prod), SQLAlchemy, Google OAuth, JWT
- **AI/ML Layer (Planned):** Sentence Transformers, FAISS Vector DB