from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.fiverr_scraper import scrape_fiverr_jobs

router = APIRouter(tags=["fiverr-jobs"])


@router.get("/search")
def search_fiverr_jobs(
    keyword: Optional[str] = "",
    limit: int = Query(default=50, le=200),
):
    """
    Search Fiverr gig listings by keyword.
    Parses Fiverr's __NEXT_DATA__ JSON blob — returns the standard
    { jobs, total } envelope used across CareerRadar.
    """
    try:
        results = scrape_fiverr_jobs(
            keywords=keyword,
            max_jobs=limit,
        )
        return {"jobs": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
