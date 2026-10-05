import api from "./api";

export const getDriveAnalytics = async () => {
  const response = await api.get("/drive/analytics");
  return response.data;
};