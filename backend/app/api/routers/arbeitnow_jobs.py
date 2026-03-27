from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.arbeitnow_scraper import scrape_arbeitnow_jobs

router = APIRouter(tags=["arbeitnow-jobs"])


@router.get("/search")
def search_arbeitnow_jobs(
    keyword: Optional[str] = "",
    location: Optional[str] = "",
    remote: Optional[str] = "",
    limit: int = Query(default=50, le=200),
):
    """Search startup and tech job listings via the Arbeitnow public API."""
    try:
        results = scrape_arbeitnow_jobs(
            keywords=keyword, location=location, remote=remote, max_jobs=limit
        )
        return {"jobs": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
