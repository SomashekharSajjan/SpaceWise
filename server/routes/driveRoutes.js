const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getRecentDriveFilesController,
  getDriveFilesController,
  driveAnalytics,
  deleteDriveFilesController,
  restoreDriveFilesController,
  getDriveTrashController,
  emptyDriveTrashController,
} = require("../controllers/driveController");

// ============================================================
// RECENT DRIVE FILES
// GET /api/drive/recent
// ============================================================

router.get(
  "/recent",
  verifyToken,
  getRecentDriveFilesController
);

// ============================================================
// GET ALL DRIVE FILES
// GET /api/drive/files/list
//
// THIS FIXES YOUR 404 ERROR
// ============================================================

router.get(
  "/files/list",
  verifyToken,
  getDriveFilesController
);

// ============================================================
// DRIVE ANALYTICS
// GET /api/drive/analytics
// ============================================================

router.get(
  "/analytics",
  verifyToken,
  driveAnalytics
);

// ============================================================
// MOVE FILES TO TRASH
// DELETE /api/drive/files
// ============================================================

router.delete(
  "/files",
  verifyToken,
  deleteDriveFilesController
);

// ============================================================
// RESTORE FILES
// POST /api/drive/files/restore
// ============================================================

router.post(
  "/files/restore",
  verifyToken,
  restoreDriveFilesController
);

// ============================================================
// GET DRIVE TRASH
// GET /api/drive/trash
// ============================================================

router.get(
  "/trash",
  verifyToken,
  getDriveTrashController
);

// ============================================================
// EMPTY DRIVE TRASH
// DELETE /api/drive/trash/empty
// ============================================================

router.delete(
  "/trash/empty",
  verifyToken,
  emptyDriveTrashController
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;