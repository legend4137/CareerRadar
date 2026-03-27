"""
Wellfound scraper replacement — uses Arbeitnow's open public API.

Arbeitnow (arbeitnow.com) provides a completely open, no-auth REST API for
startup and tech job listings, which is the same audience as Wellfound
(formerly AngelList Talent). Wellfound itself blocks all non-browser clients
with Cloudflare bot protection.

API docs: https://arbeitnow.com/api/job-board-api
"""
import requests
import time
import random
from typing import List, Dict, Any
from urllib.parse import quote


def scrape_wellfound_jobs(
    keywords: str = "",
    location: str = "",
    remote: str = "",
    max_jobs: int = 50,
) -> List[Dict[str, Any]]:
    """
    Fetch startup / tech job listings via the Arbeitnow public API.
    Results are labelled source='Wellfound'.
    """
    jobs: List[Dict[str, Any]] = []

    headers = {"User-Agent": "CareerRadar/1.0 (+https://github.com/legend4137/CareerRadar)"}

    page = 1
    results_per_page = 100  # Arbeitnow returns up to 100 items per page

    while len(jobs) < max_jobs:
        params: Dict[str, Any] = {"page": page}
        if keywords:
            params["search"] = keywords

        url = "https://www.arbeitnow.com/api/job-board-api"

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
            break

        try:
            data = resp.json()
        except ValueError:
            break

        raw_jobs = data.get("data", [])
        if not raw_jobs:
            break

        for item in raw_jobs:
            if len(jobs) >= max_jobs:
                break

            title = item.get("title") or ""
            company = item.get("company_name") or ""
            item_location = item.get("location") or ""

            # Apply location filter client-side since the API doesn't support it
            if location and location.lower() not in item_location.lower():
                continue

            # Apply remote filter
            is_remote = item.get("remote", False)
            if remote and remote.lower() == "true" and not is_remote:
                continue

            link = item.get("url") or "https://www.arbeitnow.com"

            tags_raw = item.get("tags") or []
            job_types = item.get("job_types") or []
            tags = [t.strip() for t in tags_raw if isinstance(t, str)]

            # Arbeitnow doesn't have salary or logo — provide defaults
            salary = "Undisclosed Salary"
            logo = None

            description = _strip_html(item.get("description") or "")

            jobs.append({
                "title": title.strip(),
                "company": company.strip(),
                "location": item_location.strip() if item_location else ("Remote" if is_remote else "Not specified"),
                "link": link,
                "salary": salary,
                "logo": logo,
                "description": description or None,
                "tags": tags,
                "source": "Wellfound",
            })

        # Check if there are more pages
        meta = data.get("meta", {})
        links = data.get("links", {})
        if not links.get("next") and not meta.get("next_page_url"):
            break

        if len(jobs) >= max_jobs:
            break

        page += 1
        time.sleep(random.uniform(0.3, 0.8))

    return jobs


def _strip_html(text: str) -> str:
    """Remove HTML tags from a string."""
    import re
    clean = re.compile(r"<[^>]+>")
    return clean.sub(" ", text).strip()
