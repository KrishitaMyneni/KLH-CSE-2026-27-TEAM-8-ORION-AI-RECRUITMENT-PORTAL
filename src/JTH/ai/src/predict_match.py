import joblib
import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_PATH = "ai/models/matching_classifier.joblib"

model = joblib.load(MODEL_PATH)

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

def predict_match(candidate, job):
    candidate_text = build_candidate_text(candidate)
    job_text = build_job_text(job)

    candidate_embedding = encoder.encode(
        candidate_text,
        normalize_embeddings=True
    )

    job_embedding = encoder.encode(
        job_text,
        normalize_embeddings=True
    )

    features = np.concatenate([
        candidate_embedding,
        job_embedding
    ]).reshape(1, -1)

    probability = model.predict_proba(features)[0][1]

    return round(float(probability * 100), 2)