import joblib
import numpy as np
from sentence_transformers import SentenceTransformer
from semantic_skill_gap import analyze_skill_gap

MODEL = "ai/models/screening_model.joblib"

model = joblib.load(MODEL)

device = "cuda" if __import__("torch").cuda.is_available() else "cpu"

encoder = SentenceTransformer(
    "BAAI/bge-small-en-v1.5",
    device=device
)


def build_candidate_text(candidate):
    return f"""
    Skills: {getattr(candidate, "skills", "")}
    Resume: {getattr(candidate, "resume_text", "")}
    """.strip()


def build_job_text(job):
    return f"""
    Title: {getattr(job, "title", "")}
    Company: {getattr(job, "company", "")}
    Location: {getattr(job, "location", "")}
    Description: {getattr(job, "description", "")}
    Required Skills: {getattr(job, "required_skills", "")}
    """.strip()


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
    ])


def screen_job(job, candidates, top_n=10):
    job_text = build_job_text(job)

    job_vector = encoder.encode(
        job_text,
        normalize_embeddings=True
    )

    results = []

    for candidate in candidates:
        candidate_text = build_candidate_text(candidate)

        candidate_vector = encoder.encode(
            candidate_text,
            normalize_embeddings=True
        )

        features = build_features(
            candidate_vector,
            job_vector
        ).reshape(1, -1)

        score = model.predict_proba(features)[0][1] * 100

        skill_gap = analyze_skill_gap(
            candidate,
            job
        )

        results.append({
            "candidate_id": int(candidate.candidate_id),
            "candidate_name": candidate.name,
            "match_score": round(float(score), 2),
            "strong_matches": skill_gap["strong_matches"],
            "partial_matches": skill_gap["partial_matches"],
            "missing_skills": skill_gap["missing_skills"],
            "skill_coverage": skill_gap["skill_coverage"]
        })

    results.sort(
        key=lambda x: (-x["match_score"], x["candidate_id"])
    )

    return results[:top_n]