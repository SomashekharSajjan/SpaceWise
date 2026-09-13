import axios from "axios";

export const getGmailCategories = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    "/api/gmail/categories",
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return response.data.labels || [];
};