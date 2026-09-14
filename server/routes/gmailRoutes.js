const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  gmailProfile,
  gmailCategories,
  gmailAttachments,
  gmailMessages,
  gmailMoveToTrash,
  gmailPermanentDelete,
} = require("../controllers/gmailController");

// Gmail Profile
router.get(
  "/profile",
  verifyToken,
  gmailProfile
);

// Gmail Categories
router.get(
  "/categories",
  verifyToken,
  gmailCategories
);

// Gmail Attachments
router.get(
  "/attachments",
  verifyToken,
  gmailAttachments
);

// Gmail Messages
router.get(
  "/messages",
  verifyToken,
  gmailMessages
);

// Move Gmail emails to Trash
router.post(
  "/trash",
  verifyToken,
  gmailMoveToTrash
);

// Permanently delete Gmail emails
router.delete(
  "/permanent-delete",
  verifyToken,
  gmailPermanentDelete
);

module.exports = router;