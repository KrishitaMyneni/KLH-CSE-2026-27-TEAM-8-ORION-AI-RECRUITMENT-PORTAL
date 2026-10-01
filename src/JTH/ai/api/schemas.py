from pydantic import BaseModel
from typing import List, Optional


class CandidateInput(BaseModel):
    candidate_id: int
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    skills: str = ""
    resume_url: Optional[str] = ""
    resume_text: str = ""


class JobInput(BaseModel):
    job_id: int
    title: str
    company: str
    location: str
    description: str
    required_skills: str = ""


class AnalyzeRequest(BaseModel):
    candidate: CandidateInput
    job: JobInput


class AnalyzeResponse(BaseModel):
    match_score: float
    strong_matches: List[str]
    partial_matches: List[str]
    missing_skills: List[str]
    skill_coverage: float
    learning_suggestions: List[str]


class ScreeningCandidateInput(BaseModel):

    candidate_id: int

    name: str

    email: Optional[str] = ""

    phone: Optional[str] = ""

    skills: str = ""

    resume_url: Optional[str] = ""

    resume_text: str = ""


class ScreeningJobInput(BaseModel):
    job_id: int
    title: str
    company: str
    location: str
    description: str
    required_skills: str = ""


class ScreeningRequest(BaseModel):
    mode: str
    job: ScreeningJobInput
    candidates: List[ScreeningCandidateInput]
    top_n: int