const User = require("../models/User");
const { getDriveAnalytics } = require("../services/driveService");

// ==========================================
// Storage Health
// ==========================================
const storageHealth = async (req, res) => {
  try {
    // Get logged-in user
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

    // Use both access token and refresh token
    const analytics = await getDriveAnalytics(
      user.accessToken,
      user.refreshToken,
      true
    );

    const duplicateFiles =
      analytics?.duplicateFiles || [];

    const largestFiles =
      analytics?.largestFiles || [];

    const videos =
      Number(analytics?.videos || 0);

    const images =
      Number(analytics?.images || 0);

    const storageUsedMB =
      Number(analytics?.storageUsedMB || 0);

    const suggestions = [];

    // Duplicate files
    if (duplicateFiles.length > 0) {
      suggestions.push(
        `You have ${duplicateFiles.length} duplicate file groups to review.`
      );
    }

    // Largest file
    if (largestFiles.length > 0) {
      suggestions.push(
        `Largest file: ${largestFiles[0].name || "Unknown file"}`
      );
    }

    // Videos vs images
    if (videos > images) {
      suggestions.push(
        "Videos occupy more space than images in your Google Drive."
      );
    }

    // Storage usage
    if (storageUsedMB > 8000) {
      suggestions.push(
        "Your Drive storage usage is high. Consider reviewing large files and duplicates."
      );
    } else if (storageUsedMB > 5000) {
      suggestions.push(
        "Your Drive storage is getting busy. Reviewing large files can help free space."
      );
    }

    // If everything is fine
    if (suggestions.length === 0) {
      suggestions.push(
        "Your Google Drive storage looks healthy."
      );
    }

    // Health score
    const score = Math.max(
      100 -
        duplicateFiles.length -
        Math.floor(storageUsedMB / 1000),
      10
    );

    res.json({
      success: true,

      health: {
        score,
        suggestions,
      },
    });

  } catch (err) {
    console.error("Storage Health Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// Export
// ==========================================
module.exports = {
  storageHealth,
};