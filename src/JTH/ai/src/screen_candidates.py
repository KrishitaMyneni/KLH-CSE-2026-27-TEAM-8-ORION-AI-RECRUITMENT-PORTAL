import joblib
import numpy as np
import pandas as pd

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


def build_features(candidate_vector, job_vector):
    cosine_similarity = float(
        np.dot(candidate_vector, job_vector)
    )

    absolute_difference = np.abs(
        candidate_vector - job_vector
    )

    element_product = (
        candidate_vector * job_vector
    )

    return np.concatenate([
        candidate_vector,
        job_vector,
        absolute_difference,
        element_product,
        [cosine_similarity]
    ]).reshape(1, -1)


def screen_candidates(job_id, candidate_ids, top_n=10):
    job_id = int(job_id)

    if job_id not in job_index:
        raise ValueError("Job ID not found")

    job_vector = job_embeddings[job_index[job_id]]

    results = []

    for candidate_id in candidate_ids:
        candidate_id = int(candidate_id)

        if candidate_id not in candidate_index:
            continue

        candidate_row = candidates.iloc[
            candidate_index[candidate_id]
        ]

        candidate_vector = candidate_embeddings[
            candidate_index[candidate_id]
        ]

        features = build_features(
            candidate_vector,
            job_vector
        )

        score = float(
            model.predict_proba(features)[0][1]
        ) * 100

        results.append({
            "candidate_id": candidate_id,
            "candidate_name": candidate_row.get(
                "name",
                f"Candidate {candidate_id}"
            ),
            "match_score": round(score, 2)
        })

    results.sort(
        key=lambda x: (-x["match_score"], x["candidate_id"])
    )

    return results[:top_n]


if __name__ == "__main__":

    job_id = int(input("Enter job ID: "))

    candidate_ids = [
        int(x)
        for x in input(
            "Enter candidate IDs separated by spaces: "
        ).split()
    ]

    top_n = int(
        input("Enter Top N (10/25/50/100): ")
    )

    results = screen_candidates(
        job_id,
        candidate_ids,
        top_n
    )

    print("\n===== SCREENING RESULTS =====")

    for rank, candidate in enumerate(results, 1):
        print(
            rank,
            candidate["candidate_id"],
            candidate["candidate_name"],
            candidate["match_score"]
        )