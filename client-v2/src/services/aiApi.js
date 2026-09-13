import api from "./api";

export const getStorageHealth = async () => {
  const response = await api.get("/ai/health");
  return response.data;
};
