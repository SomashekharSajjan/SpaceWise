import axios from "axios";

const API_URL =
  "/api/drive";

// ==========================================
// DELETE / MOVE DRIVE FILES TO TRASH
// ==========================================

export const deleteDriveFiles = async (
  fileIds
) => {
  const token =
    localStorage.getItem("token");

  const response = await axios.delete(
    `${API_URL}/files`,
    {
      data: {
        fileIds,
      },

      headers: {
        Authorization: token,
      },
    }
  );

  return response.data;
};

// ==========================================
// RESTORE DRIVE FILES
// ==========================================

export const restoreDriveFiles = async (
  fileIds
) => {
  const token =
    localStorage.getItem("token");

  const response = await axios.post(
    `${API_URL}/files/restore`,
    {
      fileIds,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return response.data;
};