import re
import torch
from sentence_transformers import SentenceTransformer, util


device = "cuda" if torch.cuda.is_available() else "cpu"

model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5",
    device=device
)


def split_skills(value):
    if not value:
        return []

    skills = []

    for skill in re.split(r"[,;|]", str(value)):
        skill = skill.strip().lower()

        if skill and skill not in skills:
            skills.append(skill)

    return skills


def extract_resume_text(candidate):
    resume_text = getattr(candidate, "resume_text", "") or ""
    candidate_skills = getattr(candidate, "skills", "") or ""

    return f"""
    Candidate Skills:
    {candidate_skills}

    Resume:
    {resume_text}
    """.strip()


def analyze_skill_gap(candidate, job):

    candidate_skills = split_skills(
        getattr(candidate, "skills", "") or ""
    )

    resume_text = extract_resume_text(candidate)

    required_skills = split_skills(
        getattr(job, "required_skills", "") or ""
    )

    if not required_skills:
        return {
            "strong_matches": [],
            "partial_matches": [],
            "missing_skills": [],
            "skill_coverage": 0
        }

    candidate_skill_set = set(candidate_skills)

    strong = []
    partial = []
    missing = []
    semantic_skills = []

    for skill in required_skills:
        if skill in candidate_skill_set:
            strong.append(skill)
        else:
            semantic_skills.append(skill)

    if semantic_skills and resume_text.strip():

        resume_embedding = model.encode(
            resume_text,
            normalize_embeddings=True
        )

        skill_embeddings = model.encode(
            semantic_skills,
            normalize_embeddings=True
        )

        similarities = util.cos_sim(
            skill_embeddings,
            resume_embedding
        ).flatten()

        for index, skill in enumerate(semantic_skills):

            score = float(similarities[index])

            if score >= 0.70:
                strong.append(skill)

            elif score >= 0.50:
                partial.append(skill)

            else:
                missing.append(skill)

    else:
        missing.extend(semantic_skills)

    total = len(required_skills)

    coverage = (
        (
            len(strong) +
            0.5 * len(partial)
        ) / total
    ) * 100

    return {
        "strong_matches": strong,
        "partial_matches": partial,
        "missing_skills": missing,
        "skill_coverage": round(coverage, 2)
    }