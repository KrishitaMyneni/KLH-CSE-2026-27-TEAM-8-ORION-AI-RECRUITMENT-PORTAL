import api from "./api";

export async function createApplication(applicationData) {
  const response = await api.post("/api/applications", applicationData);
  return response.data;
}

export async function getApplications() {
  const response = await api.get("/api/applications");
  return response.data;
}

export async function updateApplicationStatus(id, status) {
  const response = await api.put(
    `/api/applications/${id}/status`,
    null,
    {
      params: { status },
    }
  );

  return response.data;
}