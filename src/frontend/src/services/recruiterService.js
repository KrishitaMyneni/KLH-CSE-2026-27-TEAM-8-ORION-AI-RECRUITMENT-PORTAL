import api from "./api";

export async function createJob(jobData) {
  const response = await api.post("/api/jobs", jobData);
  return response.data;
}

export async function deleteJob(jobId) {
  const response = await api.delete(`/api/jobs/${jobId}`);
  return response.data;
}