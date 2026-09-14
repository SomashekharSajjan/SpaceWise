import api from "./api";

export const getStorageHealth = async () => {
  const token = localStorage.getItem("token");

  const res = await api.get("/ai/health", {
    headers: {
      Authorization: token,
    },
  });

  return res.data;
};