import api from "./api";

// ==========================================
// Move Gmail emails to Trash
// ==========================================

export const moveEmailsToTrash = async (messageIds) => {
  const response = await api.post("/gmail/trash", {
    messageIds,
  });

  return response.data;
};

// ==========================================
// Permanently delete Gmail emails
// ==========================================

export const permanentlyDeleteEmails = async (messageIds) => {
  const response = await api.delete("/gmail/permanent-delete", {
    data: {
      messageIds,
    },
  });

  return response.data;
};