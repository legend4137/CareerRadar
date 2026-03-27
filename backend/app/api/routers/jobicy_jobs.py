from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.jobicy_scraper import scrape_jobicy_jobs

router = APIRouter(tags=["jobicy-jobs"])


@router.get("/search")
def search_jobicy_jobs(
    keyword: Optional[str] = "",
    location: Optional[str] = "",
    experience: Optional[str] = "",
    limit: int = Query(default=50, le=200),
):
    """Search remote job listings via the Jobicy public API."""
    try:
        results = scrape_jobicy_jobs(
            keywords=keyword, location=location, max_jobs=limit, experience=experience
        )
        return {"jobs": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
