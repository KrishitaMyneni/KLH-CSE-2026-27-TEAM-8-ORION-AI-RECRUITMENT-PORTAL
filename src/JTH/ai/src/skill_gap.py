import pandas as pd
import re

candidates = pd.read_csv("ai/data/candidates.csv")
jobs = pd.read_csv("ai/data/jobs.csv")

candidate_id = int(input("Enter candidate ID: "))
job_id = int(input("Enter job ID: "))

candidate = candidates[candidates["candidate_id"] == candidate_id].iloc[0]
job = jobs[jobs["job_id"] == job_id].iloc[0]

skill_columns = [
    "skills",
    "llm_hard_skills",
    "llm_soft_skills",
    "llm_programming_languages",
    "llm_tools_technologies",
    "llm_certifications"
]

def extract_skills(row):
    skills = set()

    for column in skill_columns:
        value = str(row[column])

        if value == "nan":
            continue

        for skill in value.split(";"):
            skill = skill.strip().lower()

            if skill and skill != "_rare_skill_":
                skills.add(skill)

    return skills

candidate_skills = extract_skills(candidate)
job_skills = extract_skills(job)

matched = candidate_skills & job_skills
missing = job_skills - candidate_skills

print("\nStrong Skills:")
for skill in sorted(matched):
    print("-", skill)

print("\nMissing Skills:")
for skill in sorted(missing):
    print("-", skill)

skill_match = 0

if job_skills:
    skill_match = len(matched) / len(job_skills) * 100

print("\nSkill Match:", round(skill_match, 2), "%")

print("\nLearning Suggestions:")

for skill in sorted(missing):
    print("-", f"Learn {skill}")