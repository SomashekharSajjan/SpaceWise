const User = require("../models/User");

const {
  getDriveAnalytics,
  getDriveFiles,
  getRecentDriveFiles,
  deleteDriveFiles,
  restoreDriveFiles,
  getDriveTrash,
  emptyDriveTrash,
} = require("../services/driveService");

// ============================================================
// GET RECENT DRIVE FILES
// ============================================================

const getRecentDriveFilesController = async (
  req,
  res
) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token not found. Please log in again.",
      });
    }

    const limit = req.query.limit || 10;

    const files = await getRecentDriveFiles(
      user.accessToken,
      user.refreshToken,
      limit
    );

    return res.json({
      success: true,
      files,
      count: files.length,
    });
  } catch (err) {
    console.error(
      "Recent Drive Files Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// GET ALL DRIVE FILES
// THIS IS USED BY Files.jsx
// ============================================================

const getDriveFilesController = async (
  req,
  res
) => {
  try {
    console.log(
      "===================================="
    );

    console.log(
      "GET ALL DRIVE FILES CONTROLLER"
    );

    console.log(
      "User ID:",
      req.user?.id
    );

    console.log(
      "===================================="
    );

    const user = await User.findById(req.user.id);

    // ------------------------------------------
    // USER NOT FOUND
    // ------------------------------------------

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ------------------------------------------
    // GOOGLE ACCESS TOKEN
    // ------------------------------------------

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token not found. Please log in again.",
      });
    }

    // ------------------------------------------
    // LIMIT
    // ------------------------------------------

    const limit = req.query.limit || 100;

    // ------------------------------------------
    // GET DRIVE FILES
    // ------------------------------------------

    const files = await getDriveFiles(
      user.accessToken,
      user.refreshToken,
      limit
    );

    console.log(
      "DRIVE FILES RETURNED:",
      files.length
    );

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

    return res.json({
      success: true,
      files,
      count: files.length,
    });
  } catch (err) {
    console.error(
      "Get Drive Files Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// DRIVE ANALYTICS
// ============================================================

const driveAnalytics = async (
  req,
  res
) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token not found. Please log in again.",
      });
    }

    const analytics = await getDriveAnalytics(
      user.accessToken,
      user.refreshToken
    );

    return res.json({
      success: true,
      analytics,
    });
  } catch (err) {
    console.error(
      "Drive Analytics Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// MOVE DRIVE FILES TO TRASH
// ============================================================

const deleteDriveFilesController = async (
  req,
  res
) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token not found.",
      });
    }

    const { fileIds } = req.body;

    if (
      !Array.isArray(fileIds) ||
      fileIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No files selected.",
      });
    }

    const result = await deleteDriveFiles(
      user.accessToken,
      user.refreshToken,
      fileIds
    );

    console.log(
      "DRIVE DELETE RESULT:",
      result
    );

    if (
      !result ||
      result.deleted === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No files were moved to Trash. The selected files may not be owned by you or cannot be trashed.",
        deleted: 0,
        failed: result?.failed || [],
      });
    }

    return res.json({
      success: true,
      message: `${result.deleted} file${
        result.deleted === 1
          ? ""
          : "s"
      } moved to Trash.`,
      deleted: result.deleted,
      failed: result.failed || [],
    });
  } catch (err) {
    console.error(
      "Drive Delete Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// RESTORE DRIVE FILES
// ============================================================

const restoreDriveFilesController = async (
  req,
  res
) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token not found.",
      });
    }

    const { fileIds } = req.body;

    if (
      !Array.isArray(fileIds) ||
      fileIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No files selected.",
      });
    }

    const result =
      await restoreDriveFiles(
        user.accessToken,
        user.refreshToken,
        fileIds
      );

    return res.json({
      success: true,
      message: `${result.restored} file${
        result.restored === 1
          ? ""
          : "s"
      } restored successfully.`,
      restored: result.restored,
      failed: result.failed || [],
    });
  } catch (err) {
    console.error(
      "Drive Restore Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// GET DRIVE TRASH
// ============================================================

const getDriveTrashController = async (
  req,
  res
) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token not found. Please log in again.",
      });
    }

    const files = await getDriveTrash(
      user.accessToken,
      user.refreshToken
    );

    return res.json({
      success: true,
      files,
      count: files.length,
    });
  } catch (err) {
    console.error(
      "Drive Trash Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// EMPTY DRIVE TRASH
// ============================================================

const emptyDriveTrashController = async (
  req,
  res
) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token not found.",
      });
    }

    await emptyDriveTrash(
      user.accessToken,
      user.refreshToken
    );

    return res.json({
      success: true,
      message: "Bin cleared successfully.",
    });
  } catch (err) {
    console.error(
      "Clear Drive Bin Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getRecentDriveFilesController,
  getDriveFilesController,
  driveAnalytics,
  deleteDriveFilesController,
  restoreDriveFilesController,
  getDriveTrashController,
  emptyDriveTrashController,
};