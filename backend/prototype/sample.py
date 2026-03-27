import requests
from bs4 import BeautifulSoup
import time
import csv
import json
from urllib.parse import quote

def search_linkedin_jobs(keywords: str, location: str, max_jobs: int = 100, output_csv: str = "linkedin_jobs.csv"):
    jobs = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }

    # LinkedIn returns ~25 jobs per page
    for start in range(0, max_jobs, 25):
        url = (
            f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?"
            f"keywords={quote(keywords)}"
            f"&location={quote(location)}"
            f"&start={start}"
        )

        print(f"Fetching page starting at {start}...")
        response = requests.get(url, headers=headers)

        if response.status_code == 429:
            print("Rate limited (429). Waiting 10 seconds...")
            time.sleep(10)
            continue
        if response.status_code != 200:
            print(f"Stopped – status {response.status_code}")
            break

        soup = BeautifulSoup(response.text, "html.parser")
        job_cards = soup.find_all("div", class_="base-card")

        if not job_cards:
            print("No more jobs found.")
            break

        for card in job_cards:
            title_el = card.find("h3", class_="base-search-card__title")
            company_el = card.find("h4", class_="base-search-card__subtitle")
            location_el = card.find("span", class_="job-search-card__location")
            link_el = card.find("a", class_="base-card__full-link")

            title = title_el.text.strip() if title_el else None
            company = company_el.text.strip() if company_el else None
            loc = location_el.text.strip() if location_el else None
            link = link_el["href"].split("?")[0] if link_el else None

            # Extract job ID for full details
            job_id = link.split("/")[-1] if link and link.endswith("/") else None

            jobs.append({
                "title": title,
                "company": company,
                "location": loc,
                "link": link,
                "job_id": job_id
            })

        time.sleep(2)  # Be nice to LinkedIn

    # === Fetch full description + criteria for each job ===
    print(f"\nFetching full details for {len(jobs)} jobs...")
    for job in jobs:
        if not job["job_id"]:
            continue
        detail_url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job['job_id']}"
        resp = requests.get(detail_url, headers=headers)
        if resp.status_code != 200:
            time.sleep(2)
            continue

        detail_soup = BeautifulSoup(resp.text, "html.parser")
        desc_el = detail_soup.find("div", class_="show-more-less-html__markup")
        criteria = detail_soup.find_all("li", class_="description__job-criteria-item")

        job["description"] = desc_el.text.strip() if desc_el else None
        job["criteria"] = {}
        for item in criteria:
            label = item.find("h3")
            value = item.find("span")
            if label and value:
                job["criteria"][label.text.strip()] = value.text.strip()

        time.sleep(1.5)  # polite delay

    # Save to CSV
    if jobs:
        keys = jobs[0].keys()
        with open(output_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(jobs)
        print(f"\n✅ Saved {len(jobs)} jobs to {output_csv}")

        # Also save JSON (easier for further processing)
        with open("linkedin_jobs.json", "w", encoding="utf-8") as f:
            json.dump(jobs, f, ensure_ascii=False, indent=2)

    return jobs


# ========================== RUN IT ==========================
if __name__ == "__main__":
    # Change these to whatever you want
    results = search_linkedin_jobs(
        keywords="software engineer",      # or "data scientist", "product manager", etc.
        location="India",                  # or "Delhi", "Remote", "United States", etc.
        max_jobs=150,                      # increase if you want more (LinkedIn caps ~1000)
        output_csv="my_linkedin_jobs.csv"
    )

    print(f"\nTotal jobs scraped: {len(results)}")