import os
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
)

CANDIDATES = "ai/data/candidates.csv"
JOBS = "ai/data/jobs.csv"
TRAINING = "ai/data/matching_training.csv"

candidates = pd.read_csv(CANDIDATES)
jobs = pd.read_csv(JOBS)
training = pd.read_csv(TRAINING)

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
    candidate_id = int(row.candidate_id)
    job_id = int(row.job_id)

    if candidate_id not in candidate_index or job_id not in job_index:
        continue

    candidate_vector = candidate_embeddings[candidate_index[candidate_id]]
    job_vector = job_embeddings[job_index[job_id]]

    cosine_similarity = float(
        np.dot(candidate_vector, job_vector)
    )

    absolute_difference = np.abs(
        candidate_vector - job_vector
    )

    element_product = (
        candidate_vector * job_vector
    )

    features = np.concatenate([
        candidate_vector,
        job_vector,
        absolute_difference,
        element_product,
        [cosine_similarity]
    ])

    X.append(features)
    y.append(int(row.label))

X = np.asarray(X, dtype=np.float32)
y = np.asarray(y)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = HistGradientBoostingClassifier(
    max_iter=300,
    learning_rate=0.05,
    max_leaf_nodes=31,
    l2_regularization=1.0,
    random_state=42
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)[:, 1]

print("Accuracy:", round(accuracy_score(y_test, predictions), 4))
print("Precision:", round(precision_score(y_test, predictions), 4))
print("Recall:", round(recall_score(y_test, predictions), 4))
print("F1:", round(f1_score(y_test, predictions), 4))
print("ROC-AUC:", round(roc_auc_score(y_test, probabilities), 4))

os.makedirs("ai/models", exist_ok=True)

joblib.dump(
    model,
    "ai/models/screening_model.joblib"
)

print("Screening model saved.")