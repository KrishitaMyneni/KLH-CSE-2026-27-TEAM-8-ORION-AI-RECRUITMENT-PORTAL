from ai.src.screen_job import screen_job as semantic_screen
from ai.src.keyword_screening import screen_job as keyword_screen


def run_screening(mode, job, candidates, top_n):
    if mode == "context":
        results = semantic_screen(
            job,
            candidates,
            top_n
        )

        return {
            "mode": "context",
            "results": results
        }

    if mode == "keyword":
        results = keyword_screen(
            job,
            candidates,
            top_n
        )

        return {
            "mode": "keyword",
            "results": results
        }

    raise ValueError("Invalid screening mode")