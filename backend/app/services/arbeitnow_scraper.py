"""
arbeitnow_scraper.py — fetches startup/tech job listings from the Arbeitnow public API.
API docs: https://arbeitnow.com/api/job-board-api
"""
import requests
import re
import time
import random
from typing import List, Dict, Any


def scrape_arbeitnow_jobs(
    keywords: str = "",
    location: str = "",
    remote: str = "",
    max_jobs: int = 50,
) -> List[Dict[str, Any]]:
    """
    Fetch startup and tech job listings via the Arbeitnow public API.
    No API key required. Supports keyword search, location, and remote filters.
    """
    jobs: List[Dict[str, Any]] = []

    headers = {"User-Agent": "CareerRadar/1.0 (+https://github.com/legend4137/CareerRadar)"}

    page = 1

    while len(jobs) < max_jobs:
        params: Dict[str, Any] = {"page": page}
        if keywords:
            params["search"] = keywords

        resp = None
        for attempt in range(3):
            try:
                resp = requests.get(
                    "https://www.arbeitnow.com/api/job-board-api",
                    headers=headers, params=params, timeout=20,
                )
                if resp.status_code == 200:
                    break
                time.sleep(1 + attempt)
            except requests.RequestException:
                time.sleep(2)

        if not resp or resp.status_code != 200:
            break

        try:
            data = resp.json()
        except ValueError:
            break

        raw_jobs = data.get("data") or []
        if not raw_jobs:
            break

        for item in raw_jobs:
            if len(jobs) >= max_jobs:
                break

            title       = (item.get("title") or "").strip()
            company     = (item.get("company_name") or "").strip()
            item_loc    = (item.get("location") or "").strip()
            is_remote   = item.get("remote", False)
            link        = item.get("url") or "https://www.arbeitnow.com"
            tags        = [t.strip() for t in (item.get("tags") or []) if isinstance(t, str)]
            desc        = _strip_html(item.get("description") or "")

            # Client-side location filter
            if location and location.lower() not in item_loc.lower():
                continue
            # Client-side remote filter
            if remote and remote.lower() == "true" and not is_remote:
                continue

            jobs.append({
                "title":       title,
                "company":     company,
                "location":    item_loc if item_loc else ("Remote" if is_remote else "Not specified"),
                "link":        link,
                "salary":      "Undisclosed Salary",
                "logo":        None,
                "description": desc or None,
                "tags":        tags,
                "source":      "Arbeitnow",
            })

        links = data.get("links") or {}
        if not links.get("next"):
            break
        if len(jobs) >= max_jobs:
            break

        page += 1
        time.sleep(random.uniform(0.3, 0.8))

    return jobs


def _strip_html(text: str) -> str:
    return re.compile(r"<[^>]+>").sub(" ", text).strip()
