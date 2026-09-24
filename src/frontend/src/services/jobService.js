import api from "./api";

export async function getJobs() {
  const response = await api.get("/api/jobs");
  return response.data;
}

export async function getJobById(id) {
  const response = await api.get(`/api/jobs/${id}`);
  return response.data;
}