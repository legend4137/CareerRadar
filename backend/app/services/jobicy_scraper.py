"""
jobicy_scraper.py — fetches remote job listings from the Jobicy public API.
API docs: https://jobicy.com/jobs-rss-feed
"""
import requests
import re
import time
from typing import List, Dict, Any


def scrape_jobicy_jobs(
    keywords: str = "",
    location: str = "",
    max_jobs: int = 50,
    experience: str = "",
) -> List[Dict[str, Any]]:
    """
    Fetch remote job listings via the Jobicy public API.
    The `keywords` parameter maps to Jobicy's `tag` filter.
    No API key required.
    """
    jobs: List[Dict[str, Any]] = []

    headers = {"User-Agent": "CareerRadar/1.0 (+https://github.com/legend4137/CareerRadar)"}

    params: Dict[str, Any] = {"count": min(max_jobs, 50)}
    if keywords:
        params["tag"] = keywords.lower()
    if location:
        params["geo"] = location
    # experience is not a Jobicy filter — ignored

    resp = None
    for attempt in range(3):
        try:
            resp = requests.get(
                "https://jobicy.com/api/v2/remote-jobs",
                headers=headers, params=params, timeout=20,
            )
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

        title   = (item.get("jobTitle") or "").strip()
        company = (item.get("companyName") or "").strip()
        geo     = (item.get("jobGeo") or "Remote").strip()
        link    = item.get("url") or "https://jobicy.com"
        logo    = item.get("companyLogo") or None

        sal_min  = item.get("annualSalaryMin")
        sal_max  = item.get("annualSalaryMax")
        currency = item.get("salaryCurrency") or "USD"
        if sal_min and sal_max:
            salary = f"{currency} {int(sal_min):,} – {int(sal_max):,}"
        elif sal_min:
            salary = f"From {currency} {int(sal_min):,}"
        else:
            salary = "Undisclosed Salary"

        tags: List[str] = []
        for field in ("jobIndustry", "jobType", "jobLevel"):
            val = item.get(field)
            if val:
                tags.append(str(val))

        desc = _strip_html(item.get("jobDescription") or item.get("jobExcerpt") or "")

        jobs.append({
            "title":       title,
            "company":     company,
            "location":    geo,
            "link":        link,
            "salary":      salary,
            "logo":        logo,
            "description": desc or None,
            "tags":        [t for t in tags if t],
            "source":      "Jobicy",
        })

    return jobs


def _strip_html(text: str) -> str:
    return re.compile(r"<[^>]+>").sub(" ", text).strip()
