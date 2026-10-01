from predict_match import predict_match
from semantic_skill_gap import analyze_skill_gap


def analyze_candidate_job(candidate, job):

    match_score = predict_match(
        candidate,
        job
    )

    skill_gap = analyze_skill_gap(
        candidate,
        job
    )

    return {
        "match_score": match_score,
        "strong_matches": skill_gap["strong_matches"],
        "partial_matches": skill_gap["partial_matches"],
        "missing_skills": skill_gap["missing_skills"],
        "skill_coverage": skill_gap["skill_coverage"],
        "learning_suggestions": [
            f"Learn {skill}"
            for skill in skill_gap["missing_skills"]
        ]
    }