import numpy as np
import os
import pandas as pd
from sentence_transformers import SentenceTransformer, util

CANDIDATES = "ai/data/candidates.csv"
JOBS = "ai/data/jobs.csv"

candidates = pd.read_csv(CANDIDATES)
jobs = pd.read_csv(JOBS)

candidate_text_columns = [
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
    "llm_industry_domains"
]

job_text_columns = [
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

def build_text(row, columns):
    parts = []
    for column in columns:
        value = str(row[column]).strip()
        if value and value != "nan":
            parts.append(value)
    return " ".join(parts)

candidates["match_text"] = candidates.apply(
    lambda row: build_text(row, candidate_text_columns), axis=1
)

jobs["match_text"] = jobs.apply(
    lambda row: build_text(row, job_text_columns), axis=1
)

device = "cuda" if __import__("torch").cuda.is_available() else "cpu"

model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5",
    device=device
)

candidate_embeddings = model.encode(
    candidates["match_text"].tolist(),
    batch_size=64,
    show_progress_bar=True,
    normalize_embeddings=True
)

job_embeddings = model.encode(
    jobs["match_text"].tolist(),
    batch_size=64,
    show_progress_bar=True,
    normalize_embeddings=True
)

os.makedirs("ai/data", exist_ok=True)

np.save("ai/data/candidate_embeddings.npy", candidate_embeddings)
np.save("ai/data/job_embeddings.npy", job_embeddings)

print("Model:", model)
print("Device:", device)
print("Candidate embeddings:", candidate_embeddings.shape)
print("Job embeddings:", job_embeddings.shape)

similarity = util.cos_sim(
    candidate_embeddings[0],
    job_embeddings
)[0]

top_indices = similarity.argsort(descending=True)[:5]

print("\nTop 5 jobs for candidate", candidates.iloc[0]["candidate_id"])

for index in top_indices:
    print(
        "Job:",
        jobs.iloc[int(index)]["job_id"],
        "Score:",
        round(float(similarity[index]), 4)
    )