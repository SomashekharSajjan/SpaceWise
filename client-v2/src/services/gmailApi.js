import api from "./api";

export const getGmailProfile = async () => {
  const response = await api.get("/gmail/profile");
  return response.data;
};

export const getGmailCategories = async () => {
  const response = await api.get("/gmail/categories");
  return response.data;
};

export const getGmailAttachments = async () => {
  const response = await api.get("/gmail/attachments");
  return response.data;
};