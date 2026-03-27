import requests
from bs4 import BeautifulSoup
import time
from urllib.parse import quote
from typing import List, Dict, Any
import concurrent.futures

import random

def fetch_job_detail(job: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    if not job.get("job_id"):
        return job
        
    # Introduce jitter to avoid tripping rate limits instantaneously with multithreading
    time.sleep(random.uniform(0.5, 2.0))
    
    detail_url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job['job_id']}"
    
    # Retry logic
    resp = None
    for attempt in range(3):
        resp = requests.get(detail_url, headers=headers)
        if resp.status_code == 200:
            break
        elif resp.status_code == 429:
            time.sleep(2 + attempt * 2)  # Exponential backoff
        else:
            break
            
    if resp and resp.status_code == 200:
        detail_soup = BeautifulSoup(resp.text, "html.parser")
        desc_el = detail_soup.find("div", class_="show-more-less-html__markup")
        criteria = detail_soup.find_all("li", class_="description__job-criteria-item")
        
        if desc_el:
            for br in desc_el.find_all("br"):
                br.replace_with("\n")
            for li in desc_el.find_all("li"):
                li.insert(0, "• ")
                li.append("\n")
            for p in desc_el.find_all(["p", "h1", "h2", "h3", "h4"]):
                p.append("\n")
            
            raw_text = desc_el.get_text()
            lines = [line.strip() for line in raw_text.splitlines()]
            job["description"] = "\n".join(lines).strip()
        else:
            job["description"] = None
        
        tags = []
        for item in criteria:
            val = item.find("span")
            if val:
                tags.append(val.text.strip())
        job["tags"] = tags
    else:
        job["description"] = None
        job["tags"] = []
    return job

def scrape_linkedin_jobs(
    keywords: str = "",
    location: str = "",
    max_jobs: int = 150,
    date_since_posted: str = "",
    job_type: str = "",
    remote_filter: str = "",
    salary: str = "",
    experience_level: str = "",
    sort_by: str = ""
) -> List[Dict[str, Any]]:
    jobs = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }

    # Simplified mappings for LinkedIn queries
    filter_params = []
    if date_since_posted:
        filter_params.append(f"f_TPR={quote(date_since_posted)}")
    if job_type:
        filter_params.append(f"f_JT={quote(job_type)}")
    if remote_filter:
        filter_params.append(f"f_WT={quote(remote_filter)}")
    if experience_level:
        filter_params.append(f"f_E={quote(experience_level)}")
    
    filter_query = "&" + "&".join(filter_params) if filter_params else ""
    if sort_by:
        filter_query += f"&sortBy={quote(sort_by)}"

    # LinkedIn returns ~25 jobs per page
    for start in range(0, max_jobs, 25):
        url = (
            f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?"
            f"keywords={quote(keywords)}"
            f"&location={quote(location)}"
            f"&start={start}"
            f"{filter_query}"
        )

        response = requests.get(url, headers=headers)

        if response.status_code == 429:
            time.sleep(2)
            continue
        if response.status_code != 200:
            break

        soup = BeautifulSoup(response.text, "html.parser")
        job_cards = soup.find_all("div", class_="base-card")

        if not job_cards:
            break

        for card in job_cards:
            if len(jobs) >= max_jobs:
                break
                
            title_el = card.find("h3", class_="base-search-card__title")
            company_el = card.find("h4", class_="base-search-card__subtitle")
            location_el = card.find("span", class_="job-search-card__location")
            link_el = card.find("a", class_="base-card__full-link")
            
            salary_el = card.find("span", class_="job-search-card__salary-info")
            img_el = card.find("img")

            title = title_el.text.strip() if title_el else None
            company = company_el.text.strip() if company_el else None
            loc = location_el.text.strip() if location_el else None
            link = link_el["href"].split("?")[0] if link_el else None
            
            salary = salary_el.text.strip() if salary_el else "Undisclosed Salary"
            
            logo = None
            if img_el:
                logo = img_el.get("data-delayed-url") or img_el.get("src")
            
            job_id = None
            if link:
                parts = [p for p in link.split("/") if p]
                if parts:
                    last_part = parts[-1]
                    if last_part.isdigit():
                        job_id = last_part
                    elif "-" in last_part:
                        potential_id = last_part.split("-")[-1]
                        if potential_id.isdigit():
                            job_id = potential_id

            jobs.append({
                "title": title,
                "company": company,
                "location": loc,
                "link": link,
                "job_id": job_id,
                "salary": salary,
                "logo": logo,
            })

        if len(jobs) >= max_jobs:
            break
            
        time.sleep(0.5)

    # Fetch full descriptions concurrently to save time, max_workers 5 to avoid heavy rate limiting
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(fetch_job_detail, job, headers): job for job in jobs}
        concurrent.futures.wait(futures)

    return jobs
