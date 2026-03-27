from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.wellfound_scraper import scrape_wellfound_jobs

router = APIRouter(tags=["wellfound-jobs"])


@router.get("/search")
def search_wellfound_jobs(
    keyword: Optional[str] = "",
    location: Optional[str] = "",
    remote: Optional[str] = "",
    limit: int = Query(default=50, le=200),
):
    """
    Search Wellfound (AngelList Talent) job listings.
    Parses Wellfound's __NEXT_DATA__ JSON blob — returns the standard
    { jobs, total } envelope used across CareerRadar.
    """
    try:
        results = scrape_wellfound_jobs(
            keywords=keyword,
            location=location,
            remote=remote,
            max_jobs=limit,
        )
        return {"jobs": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
