from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from app.services.linkedin_scraper import scrape_linkedin_jobs

router = APIRouter(tags=["jobs"])

@router.get("/search")
def search_jobs(
    keyword: Optional[str] = "",
    location: Optional[str] = "",
    dateSincePosted: Optional[str] = "",
    jobType: Optional[str] = "",
    remoteFilter: Optional[str] = "",
    salary: Optional[str] = "",
    experienceLevel: Optional[str] = "",
    limit: int = 150,
    sortBy: Optional[str] = "",
    page: int = 0  # To maintain API signature as per UI, though we fetch all upfront
):
    """
    Search LinkedIn jobs via scraping.
    Runs synchronously as it requires blocking HTTP requests.
    """
    try:
        results = scrape_linkedin_jobs(
            keywords=keyword,
            location=location,
            max_jobs=limit,
            date_since_posted=dateSincePosted,
            job_type=jobType,
            remote_filter=remoteFilter,
            salary=salary,
            experience_level=experienceLevel,
            sort_by=sortBy
        )
        return {"jobs": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
