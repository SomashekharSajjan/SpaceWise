import api from "./api";

export const getGmailProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await api.get("/gmail/profile", {
    headers: {
      Authorization: token,
    },
  });

  return res.data;
};