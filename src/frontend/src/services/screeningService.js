import api from "./api";

export const getScreenings = async () => {
  const response = await api.get("/api/screenings");
  return response.data;
};

export const createScreening = async (screening) => {
  const response = await api.post("/api/screenings", screening);
  return response.data;
};

export const getScreeningById = async (id) => {
  const response = await api.get(`/api/screenings/${id}`);
  return response.data;
};