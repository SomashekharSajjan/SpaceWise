import api from "./api";

// ==========================================
// DELETE / MOVE DRIVE FILES TO TRASH
// ==========================================

export const deleteDriveFiles = async (fileIds) => {
  const response = await api.delete("/drive/files", {
    data: {
      fileIds,
    },
  });

  return response.data;
};

// ==========================================
// RESTORE DRIVE FILES
// ==========================================

export const restoreDriveFiles = async (fileIds) => {
  const response = await api.post("/drive/files/restore", {
    fileIds,
  });

  return response.data;
};