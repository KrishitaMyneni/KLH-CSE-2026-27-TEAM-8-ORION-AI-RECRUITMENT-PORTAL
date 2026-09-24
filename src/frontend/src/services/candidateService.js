import api from "./api";

export async function getCandidates() {
  const response = await api.get("/api/candidates");
  return response.data;
}

export async function updateCandidate(id, candidateData) {
  const response = await api.put(`/api/candidates/${id}`, candidateData);
  return response.data;
}