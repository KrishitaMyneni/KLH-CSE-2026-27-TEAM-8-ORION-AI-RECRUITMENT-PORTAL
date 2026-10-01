import pandas as pd
import os

BASE = "data"
OUT = "ai/data"

os.makedirs(OUT, exist_ok=True)

candidates = pd.read_csv(f"{BASE}/processed/candidates_clean.csv")
jobs = pd.read_csv(f"{BASE}/processed/jobs_clean.csv")
history = pd.read_csv(f"{BASE}/processed/history_clean.csv")

skill_columns = [
    "skills",
    "expertise_area",
    "llm_hard_skills",
    "llm_soft_skills",
    "llm_programming_languages",
    "llm_tools_technologies",
    "llm_certifications",
    "llm_industry_domains"
]

candidate_columns = [
    "candidate_id",
    "skills",
    "expertise_area",
    "job_category",
    "years_experience",
    "llm_years_of_work_experience",
    "llm_highest_diploma",
    "llm_hard_skills",
    "llm_soft_skills",
    "llm_programming_languages",
    "llm_tools_technologies",
    "llm_certifications",
    "llm_industry_domains",
    "llm_management_experience",
    "llm_leadership_experience",
    "llm_freelance_experience",
    "llm_contract_experience",
    "llm_international_work_experience",
    "llm_remote_work_experience"
]

job_columns = [
    "job_id",
    "job_category",
    "skills",
    "contract_type",
    "expertise_area",
    "years_experience",
    "llm_remote_possible",
    "llm_industry_domains",
    "llm_seniority_level",
    "llm_required_languages_spoken",
    "llm_required_lowest_diploma",
    "llm_required_years_of_work_experience",
    "llm_required_management_experience",
    "llm_required_freelance_experience",
    "llm_required_contract_experience",
    "llm_required_international_work_experience",
    "llm_required_leadership_experience",
    "llm_hard_skills",
    "llm_soft_skills",
    "llm_programming_languages",
    "llm_tools_technologies",
    "llm_certifications"
]

candidates = candidates[candidate_columns].copy()
jobs = jobs[job_columns].copy()
history = history[["candidate_id", "job_id", "last_stage_reached"]].copy()

for df in [candidates, jobs]:
    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = df[col].fillna("").astype(str)
            df[col] = df[col].str.replace("_rare_skill_", "", regex=False)
            df[col] = df[col].str.replace(r"\s+", " ", regex=True).str.strip()

history["last_stage_reached"] = history["last_stage_reached"].fillna("").astype(str).str.strip()

candidates.to_csv(f"{OUT}/candidates.csv", index=False)
jobs.to_csv(f"{OUT}/jobs.csv", index=False)
history.to_csv(f"{OUT}/history.csv", index=False)

print("Preprocessing complete")
print("Candidates:", len(candidates))
print("Jobs:", len(jobs))
print("History:", len(history))