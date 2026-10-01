import joblib
import numpy as np
import pandas as pd
import re

CANDIDATES = "ai/data/candidates.csv"
JOBS = "ai/data/jobs.csv"
MODEL = "ai/models/screening_model.joblib"

candidates = pd.read_csv(CANDIDATES)
jobs = pd.read_csv(JOBS)

candidate_embeddings = np.load("ai/data/candidate_embeddings.npy")
job_embeddings = np.load("ai/data/job_embeddings.npy")

model = joblib.load(MODEL)

candidate_index = {
    int(row.candidate_id): i
    for i, row in candidates.iterrows()
}

job_index = {
    int(row.job_id): i
    for i, row in jobs.iterrows()
}


def clean_skills(value):
    if pd.isna(value):
        return set()

    text = str(value).lower()

    parts = re.split(r"[,;|/\n]", text)

    return {
        p.strip()
        for p in parts
        if p.strip() and p.strip() != "nan" and not p.strip().startswith("_")
    }


def get_skills(row):
    skills = set()

    for column in [
        "skills",
        "llm_hard_skills",
        "llm_programming_languages",
        "llm_tools_technologies"
    ]:
        if column in row.index:
            skills.update(clean_skills(row[column]))

    return skills


def build_features(candidate_vector, job_vector):
    cosine_similarity = float(
        np.dot(candidate_vector, job_vector)
    )

    absolute_difference = np.abs(
        candidate_vector - job_vector
    )

    element_product = candidate_vector * job_vector

    return np.concatenate([
        candidate_vector,
        job_vector,
        absolute_difference,
        element_product,
        [cosine_similarity]
    ]).reshape(1, -1)


def explain_candidate(candidate_id, job_id):

    candidate_idx = candidate_index[int(candidate_id)]
    job_idx = job_index[int(job_id)]

    candidate = candidates.iloc[candidate_idx]
    job = jobs.iloc[job_idx]

    candidate_vector = candidate_embeddings[candidate_idx]
    job_vector = job_embeddings[job_idx]

    features = build_features(
        candidate_vector,
        job_vector
    )

    score = float(
        model.predict_proba(features)[0][1]
    ) * 100

    candidate_skills = get_skills(candidate)
    job_skills = get_skills(job)

    matched = sorted(
        candidate_skills.intersection(job_skills)
    )

    missing = sorted(
        job_skills.difference(candidate_skills)
    )

    if matched:
        explanation = (
            "Candidate has relevant skills that align "
            "with the job requirements."
        )
    else:
        explanation = (
            "Candidate has semantic similarity with "
            "the job requirements, but no directly "
            "overlapping extracted skills."
        )

    return {
        "candidate_id": int(candidate_id),
        "candidate_name": candidate.get(
            "name",
            f"Candidate {candidate_id}"
        ),
        "match_score": round(score, 2),
        "matched_areas": matched,
        "missing_or_weak_areas": missing,
        "explanation": explanation
    }


if __name__ == "__main__":

    job_id = int(input("Enter job ID: "))
    candidate_id = int(input("Enter candidate ID: "))

    result = explain_candidate(
        candidate_id,
        job_id
    )

    print("\n===== AI CANDIDATE ANALYSIS =====")
    print("Candidate:", result["candidate_name"])
    print("Candidate ID:", result["candidate_id"])
    print("Match Score:", result["match_score"], "%")

    print("\nMatched / Relevant Areas:")
    print(result["matched_areas"])

    print("\nMissing / Weak Areas:")
    print(result["missing_or_weak_areas"])

    print("\nExplanation:")
    print(result["explanation"])