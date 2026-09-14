const User = require("../models/User");

const {
  getGmailProfile,
  getGmailCategories,
  getLargestAttachments,
  getGmailMessages,
  moveEmailsToTrash,
  permanentlyDeleteEmails,
} = require("../services/gmailService");

// ==========================================
// Gmail Messages
// ==========================================
// ==========================================
// Gmail Messages
// ==========================================
const gmailMessages = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token not found",
      });
    }

    const type =
      req.query.type || "all";

    const pageToken =
      req.query.pageToken || null;
      const limit =
  req.query.limit || 100;

    console.log(
      "===================================="
    );

    console.log(
      "GMAIL MESSAGES REQUEST"
    );

    console.log("TYPE:", type);
    console.log(
      "PAGE TOKEN:",
      pageToken
    );
    console.log(
  "LIMIT:",
  limit
);

    const result =
  await getGmailMessages(
    user.accessToken,
    user.refreshToken,
    type,
    pageToken,
    limit
  );

    return res.json({
      success: true,

      messages:
        result.messages || [],

      nextPageToken:
        result.nextPageToken || null,

      resultSizeEstimate:
        result.resultSizeEstimate || 0,
    });
  } catch (err) {
    console.error(
      "Gmail Messages Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// Gmail Profile
// ==========================================
const gmailProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message: "Google access token not found",
      });
    }

    const profile = await getGmailProfile(
  user.accessToken,
  user.refreshToken
);

res.json({
  success: true,
  profile: {
    ...profile,
    name: user.name || "",
  },
});
  } catch (err) {
    console.error("Gmail Profile Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// Gmail Categories
// ==========================================
const gmailCategories = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message: "Google access token not found",
      });
    }

    const labels = await getGmailCategories(
      user.accessToken,
      user.refreshToken
    );

    res.json({
      success: true,
      labels,
    });
  } catch (err) {
    console.error("Gmail Categories Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// Largest Attachments
// ==========================================
const gmailAttachments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message: "Google access token not found",
      });
    }

    const attachments = await getLargestAttachments(
      user.accessToken,
      user.refreshToken
    );

    res.json({
      success: true,
      attachments,
    });
  } catch (err) {
    console.error("Gmail Attachments Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// Move Emails To Trash
// ==========================================
const gmailMoveToTrash = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message: "Google access token not found",
      });
    }

    const { messageIds } = req.body;

    if (
      !Array.isArray(messageIds) ||
      messageIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No email IDs were provided",
      });
    }

    console.log("====================================");
    console.log(
      "GMAIL DELETE REQUEST:",
      messageIds
    );

    const result = await moveEmailsToTrash(
      user.accessToken,
      user.refreshToken,
      messageIds
    );

    console.log(
      "GMAIL DELETE RESULT:",
      result
    );

    // Nothing actually moved
    if (!result || result.movedCount === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No emails were moved to Trash.",
        movedCount: 0,
        failed: result?.failed || [],
      });
    }

    return res.json({
      success: true,
      message: `${result.movedCount} email${
        result.movedCount === 1 ? "" : "s"
      } moved to Trash successfully.`,
      movedCount: result.movedCount,
      failed: result.failed || [],
    });
  } catch (err) {
    console.error(
      "Gmail Move To Trash Error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// ==========================================
// Permanently Delete Emails
// ==========================================
// ==========================================
// Permanently Delete Emails
// ==========================================
// ==========================================
// Permanently Delete Emails
// ==========================================
// ==========================================
// Permanently Delete Gmail Emails
// ==========================================
const gmailPermanentDelete = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.accessToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token not found",
      });
    }

    const { messageIds } =
      req.body;

    if (
      !Array.isArray(messageIds) ||
      messageIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No email IDs were provided",
      });
    }

    console.log(
      "===================================="
    );

    console.log(
      "PERMANENT DELETE REQUEST:"
    );

    console.log(
      "USER:",
      user.email
    );

    console.log(
      "MESSAGE IDS:",
      messageIds
    );

    console.log(
      "===================================="
    );

    const result =
      await permanentlyDeleteEmails(
        user.accessToken,
        user.refreshToken,
        messageIds
      );

    console.log(
      "PERMANENT DELETE RESULT:",
      result
    );

    // ========================================
    // RETURN RESULT
    // ========================================

    return res.json({
      success:
        result.deletedCount > 0,

      message:
        result.deletedCount > 0
          ? `${result.deletedCount} email${
              result.deletedCount === 1
                ? ""
                : "s"
            } permanently deleted.`
          : "No emails were permanently deleted.",

      deletedCount:
        result.deletedCount,

      failed:
        result.failed || [],
    });
  } catch (err) {
    console.error(
      "Gmail Permanent Delete Error:",
      err
    );

    return res.status(500).json({
      success: false,

      message:
        err.response?.data?.error?.message ||
        err.message,
    });
  }
};

// ==========================================
// Export Controllers
// ==========================================
module.exports = {
  gmailProfile,
  gmailCategories,
  gmailAttachments,
  gmailMessages,
  gmailMoveToTrash,
  gmailPermanentDelete,
};