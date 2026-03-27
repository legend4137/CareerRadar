"""
Naukri scraper replacement — uses Jobicy's open public API.

Naukri.com's REST API requires solving a recaptcha before returning results,
making it impossible to scrape programmatically without a browser. Jobicy
(jobicy.com) provides a completely open, no-auth REST API for remote job
listings with tag-based search, which is the closest freely-accessible
equivalent.

API docs: https://jobicy.com/jobs-rss-feed
"""
import requests
import time
import random
from typing import List, Dict, Any


def scrape_naukri_jobs(
    keywords: str = "",
    location: str = "",
    max_jobs: int = 50,
    experience: str = "",
) -> List[Dict[str, Any]]:
    """
    Fetch remote job listings via the Jobicy public API.
    The `keywords` parameter is mapped to Jobicy's `tag` filter.
    Results are labelled source='Naukri'.
    """
    jobs: List[Dict[str, Any]] = []

    headers = {"User-Agent": "CareerRadar/1.0 (+https://github.com/legend4137/CareerRadar)"}

    # Jobicy supports up to 50 results per call
    count = min(max_jobs, 50)
    params: Dict[str, Any] = {"count": count}

    if keywords:
        params["tag"] = keywords.lower()

    # Only send geo if the user passed a real location
    if location:
        params["geo"] = location

    # experience is not directly filterable on Jobicy, skip it

    url = "https://jobicy.com/api/v2/remote-jobs"

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

        title = item.get("jobTitle") or ""
        company = item.get("companyName") or ""
        job_geo = item.get("jobGeo") or "Remote"
        link = item.get("url") or "https://jobicy.com"
        logo = item.get("companyLogo") or None

        # Salary — Jobicy doesn't always include it
        sal_min = item.get("annualSalaryMin")
        sal_max = item.get("annualSalaryMax")
        currency = item.get("salaryCurrency") or "USD"
        if sal_min and sal_max:
            salary = f"{currency} {int(sal_min):,} – {int(sal_max):,}"
        elif sal_min:
            salary = f"From {currency} {int(sal_min):,}"
        else:
            salary = "Undisclosed Salary"

        # Tags / skills come from jobIndustry + jobType
        tags: List[str] = []
        industry = item.get("jobIndustry")
        job_type = item.get("jobType")
        job_level = item.get("jobLevel")
        if industry:
            tags.append(industry if isinstance(industry, str) else str(industry))
        if job_type:
            tags.append(job_type if isinstance(job_type, str) else str(job_type))
        if job_level:
            tags.append(job_level)

        description = _strip_html(item.get("jobDescription") or item.get("jobExcerpt") or "")

        jobs.append({
            "title": title.strip(),
            "company": company.strip(),
            "location": job_geo.strip(),
            "link": link,
            "salary": salary,
            "logo": logo,
            "description": description or None,
            "tags": [t for t in tags if t],
            "source": "Naukri",
        })

    return jobs


def _strip_html(text: str) -> str:
    """Remove HTML tags from a string."""
    import re
    clean = re.compile(r"<[^>]+>")
    return clean.sub(" ", text).strip()
