import api from "./api";

export const getGmailCategories = async () => {
  const response = await api.get("/gmail/categories");

  return response.data.labels || [];
};