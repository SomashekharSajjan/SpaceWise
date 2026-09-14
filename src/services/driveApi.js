import api from "./api";

export const getDriveAnalytics = async () => {
  const token = localStorage.getItem("token");

  const res = await api.get("/drive/analytics", {
    headers: {
      Authorization: token,
    },
  });

  return res.data;
};