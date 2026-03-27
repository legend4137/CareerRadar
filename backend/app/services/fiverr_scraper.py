"""
Fiverr scraper replacement — uses Remotive's open public API.

Remotive (remotive.com) provides a completely open, no-auth REST API for
remote and contract job listings — the closest open-data match for the
type of remote/freelance work that Fiverr's job board targets.

API docs: https://remotive.com/api/remote-jobs
"""
import requests
import time
import random
from typing import List, Dict, Any
from urllib.parse import quote


def scrape_fiverr_jobs(
    keywords: str = "",
    max_jobs: int = 50,
) -> List[Dict[str, Any]]:
    """
    Fetch remote / contract job listings via the Remotive public API.
    Results are labelled source='Fiverr' and include a direct link to
    the original job posting.
    """
    jobs: List[Dict[str, Any]] = []

    headers = {"User-Agent": "CareerRadar/1.0 (+https://github.com/legend4137/CareerRadar)"}

    # Remotive supports up to 20 results per request when filtered by search
    # Make paginated-style calls by fetching more and slicing
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

    raw_jobs = data.get("jobs", [])

    for item in raw_jobs:
        if len(jobs) >= max_jobs:
            break

        title = item.get("title") or ""
        company = item.get("company_name") or ""
        location = item.get("candidate_required_location") or "Remote"
        link = item.get("url") or "https://remotive.com"
        logo = item.get("company_logo_url") or item.get("company_logo") or None
        salary = item.get("salary") or "See listing"

        tags_raw = item.get("tags") or []
        tags = [t.strip() for t in tags_raw if isinstance(t, str)]

        # Strip HTML from description
        description = _strip_html(item.get("description") or "")

        jobs.append({
            "title": title.strip(),
            "company": company.strip(),
            "location": location.strip(),
            "link": link,
            "salary": salary if salary else "See listing",
            "logo": logo,
            "description": description or None,
            "tags": tags,
            "source": "Fiverr",
        })

    return jobs


def _strip_html(text: str) -> str:
    """Remove HTML tags from a string."""
    import re
    clean = re.compile(r"<[^>]+>")
    return clean.sub(" ", text).strip()
