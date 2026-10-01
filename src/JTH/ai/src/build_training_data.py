import pandas as pd
import os

HISTORY = "ai/data/history.csv"
OUT = "ai/data"

history = pd.read_csv(HISTORY)

stage_order = {
    "Application Made": 1,
    "Resume Sent": 2,
    "Qualification": 3,
    "Shortlist": 4,
    "1st Interview": 5,
    "2nd Interview": 6,
    "3rd Interview": 7,
    "4th Interview": 8,
    "Offer Received": 9,
    "Offer Accepted": 10
}

history["stage_score"] = history["last_stage_reached"].map(stage_order)

training = (
    history
    .groupby(["candidate_id", "job_id"], as_index=False)["stage_score"]
    .max()
)

training["label"] = (training["stage_score"] >= 4).astype(int)

training = training[["candidate_id", "job_id", "stage_score", "label"]]

os.makedirs(OUT, exist_ok=True)

training.to_csv(
    f"{OUT}/matching_training.csv",
    index=False
)

print("Training data created")
print("Candidate-job pairs:", len(training))
print("Positive pairs:", training["label"].sum())
print("Negative pairs:", (training["label"] == 0).sum())