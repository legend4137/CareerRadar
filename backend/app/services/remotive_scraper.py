"""
remotive_scraper.py — fetches remote/contract job listings from the Remotive public API.
API docs: https://remotive.com/api/remote-jobs
"""
import requests
import re
import time
from typing import List, Dict, Any


def scrape_remotive_jobs(
    keywords: str = "",
    max_jobs: int = 50,
) -> List[Dict[str, Any]]:
    """
    Fetch remote job listings via the Remotive public API.
    No API key required.
    """
    jobs: List[Dict[str, Any]] = []

    headers = {"User-Agent": "CareerRadar/1.0 (+https://github.com/legend4137/CareerRadar)"}

    url = "https://remotive.com/api/remote-jobs"
    params: Dict[str, Any] = {"limit": min(max_jobs, 100)}
    if keywords:
        params["search"] = keywords

    resp = None
    for attempt in range(3):
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=20)
            if resp.status_code == 200:
                break
            time.sleep(1 + attempt)
        except requests.RequestException:
            time.sleep(2)

    if not resp or resp.status_code != 200:
        return []

    try:
        data = resp.json()
    except ValueError:
        return []

    for item in (data.get("jobs") or []):
        if len(jobs) >= max_jobs:
            break

        title    = (item.get("title") or "").strip()
        company  = (item.get("company_name") or "").strip()
        location = (item.get("candidate_required_location") or "Remote").strip()
        link     = item.get("url") or "https://remotive.com"
        logo     = item.get("company_logo_url") or item.get("company_logo") or None
        salary   = item.get("salary") or "See listing"
        tags     = [t.strip() for t in (item.get("tags") or []) if isinstance(t, str)]
        desc     = _strip_html(item.get("description") or "")

        jobs.append({
            "title":       title,
            "company":     company,
            "location":    location,
            "link":        link,
            "salary":      salary if salary else "See listing",
            "logo":        logo,
            "description": desc or None,
            "tags":        tags,
            "source":      "Remotive",
        })

    return jobs


def _strip_html(text: str) -> str:
    return re.compile(r"<[^>]+>").sub(" ", text).strip()
