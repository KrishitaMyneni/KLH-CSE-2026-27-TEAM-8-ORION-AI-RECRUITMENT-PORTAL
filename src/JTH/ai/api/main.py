from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import sys
from pathlib import Path

from ai.api.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    ScreeningRequest
)

AI_SRC = Path(__file__).resolve().parent.parent / "src"

if str(AI_SRC) not in sys.path:
    sys.path.append(str(AI_SRC))

from orion_ai import analyze_candidate_job
from screening_api import run_screening


app = FastAPI(
    title="Orion AI Service",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "orion-ai"
    }


@app.post("/api/ai/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):

    try:
        result = analyze_candidate_job(
            request.candidate,
            request.job
        )

        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Candidate analysis failed: {str(e)}"
        )


@app.post("/api/ai/screen")
def screen_candidates(request: ScreeningRequest):

    try:
        result = run_screening(
    request.mode,
    request.job,
    request.candidates,
    request.top_n
)

        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI screening failed: {str(e)}"
        )