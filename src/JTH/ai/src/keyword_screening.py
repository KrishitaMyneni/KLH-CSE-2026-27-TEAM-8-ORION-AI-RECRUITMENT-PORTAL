import re


def extract_keywords(value):
    keywords = set()

    if not value:
        return keywords

    for item in re.split(r"[,;|]", str(value)):
        item = item.strip().lower()

        if item and item != "_rare_skill_":
            item = re.sub(r"\s+", " ", item)
            keywords.add(item)

    return keywords


def keyword_match(candidate, job):
    candidate_keywords = extract_keywords(
        getattr(candidate, "skills", "")
    )

    job_keywords = extract_keywords(
        getattr(job, "required_skills", "")
    )

    matched = candidate_keywords & job_keywords
    missing = job_keywords - candidate_keywords

    if job_keywords:
        score = (
            len(matched) /
            len(job_keywords)
        ) * 100
    else:
        score = 0

    return {
        "keyword_score": round(score, 2),
        "matched_keywords": sorted(matched),
        "missing_keywords": sorted(missing)
    }


def screen_job(job, candidates, top_n=10):
    results = []

    for candidate in candidates:

        result = keyword_match(
            candidate,
            job
        )

        results.append({
            "candidate_id": int(candidate.candidate_id),
            "candidate_name": candidate.name,
            "keyword_score": result["keyword_score"],
            "matched_keywords": result["matched_keywords"],
            "missing_keywords": result["missing_keywords"]
        })

    results.sort(
        key=lambda x: (
            -x["keyword_score"],
            x["candidate_id"]
        )
    )

    return results[:top_n]