import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

candidates = pd.read_csv("ai/data/candidates.csv")
jobs = pd.read_csv("ai/data/jobs.csv")
training = pd.read_csv("ai/data/matching_training.csv")

candidate_embeddings = np.load("ai/data/candidate_embeddings.npy")
job_embeddings = np.load("ai/data/job_embeddings.npy")

candidate_index = {
    int(row.candidate_id): i
    for i, row in candidates.iterrows()
}

job_index = {
    int(row.job_id): i
    for i, row in jobs.iterrows()
}

X = []
y = []

for row in training.itertuples(index=False):
    if row.candidate_id not in candidate_index or row.job_id not in job_index:
        continue

    candidate_vector = candidate_embeddings[candidate_index[row.candidate_id]]
    job_vector = job_embeddings[job_index[row.job_id]]

    X.append(np.concatenate([candidate_vector, job_vector]))
    y.append(row.label)

X = np.array(X)
y = np.array(y)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)

print(classification_report(y_test, predictions))

joblib.dump(
    model,
    "ai/models/matching_classifier.joblib"
)

print("Matching classifier saved.")