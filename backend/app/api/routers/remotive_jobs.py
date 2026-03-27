from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.remotive_scraper import scrape_remotive_jobs

router = APIRouter(tags=["remotive-jobs"])


@router.get("/search")
def search_remotive_jobs(
    keyword: Optional[str] = "",
    limit: int = Query(default=50, le=200),
):
    """Search remote job listings via the Remotive public API."""
    try:
        results = scrape_remotive_jobs(keywords=keyword, max_jobs=limit)
        return {"jobs": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
