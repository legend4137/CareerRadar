from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.naukri_scraper import scrape_naukri_jobs

router = APIRouter(tags=["naukri-jobs"])


@router.get("/search")
def search_naukri_jobs(
    keyword: Optional[str] = "",
    location: Optional[str] = "",
    experience: Optional[str] = "",
    limit: int = Query(default=50, le=200),
):
    """
    Search Naukri.com job listings via their public REST API.
    Returns the standard { jobs, total } envelope used across CareerRadar.
    """
    try:
        results = scrape_naukri_jobs(
            keywords=keyword,
            location=location,
            max_jobs=limit,
            experience=experience,
        )
        return {"jobs": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
