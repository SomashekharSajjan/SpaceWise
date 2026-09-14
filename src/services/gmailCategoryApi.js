import api from "./api";

export const getGmailCategories = async () => {
  const token = localStorage.getItem("token");

  const res = await api.get("/gmail/categories", {
    headers: {
      Authorization: token,
    },
  });

  return res.data;
};