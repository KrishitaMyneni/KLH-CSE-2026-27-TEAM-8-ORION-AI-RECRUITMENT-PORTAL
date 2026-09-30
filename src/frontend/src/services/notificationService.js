import api from "./api";

export async function getNotifications() {
  const response = await api.get("/api/notifications");
  return response.data;
}

export async function createNotification(notification) {
  const response = await api.post("/api/notifications", notification);
  return response.data;
}