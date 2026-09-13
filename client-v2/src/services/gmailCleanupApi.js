import axios from "axios";

// ==========================================
// Move Gmail emails to Trash
// ==========================================
export const moveEmailsToTrash = async (messageIds) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    "/api/gmail/trash",
    {
      messageIds,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return response.data;
};

// ==========================================
// Permanently delete Gmail emails
// ==========================================
export const permanentlyDeleteEmails = async (messageIds) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    "/api/gmail/permanent-delete",
    {
      headers: {
        Authorization: token,
      },
      data: {
        messageIds,
      },
    }
  );

  return response.data;
};