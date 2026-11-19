
const User = require("../models/User");
const { getDriveAnalytics } = require("../services/driveService");

// ==========================================
// Storage Health
// ==========================================
const storageHealth = async (req, res) => {
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

    // Fetch lightweight Drive analytics.
    // Do not run the expensive duplicate scan here.
    const analytics = await getDriveAnalytics(
      user.accessToken,
      user.refreshToken,
      false
    );

    const largestFiles = analytics?.largestFiles || [];
    const videos = Number(analytics?.videos || 0);
    const images = Number(analytics?.images || 0);
    const storageUsedMB = Number(analytics?.storageUsedMB || 0);

    const suggestions = [];

    if (largestFiles.length > 0) {
      suggestions.push(
        `Largest file: ${largestFiles[0].name || "Unknown file"}`
      );
    }

    if (videos > images) {
      suggestions.push(
        "Videos occupy more space than images in your Google Drive."
      );
    }

    if (storageUsedMB > 8000) {
      suggestions.push(
        "Your Drive storage usage is high. Consider reviewing large files."
      );
    } else if (storageUsedMB > 5000) {
      suggestions.push(
        "Your Drive storage is getting busy. Reviewing large files can help free space."
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        "Your Google Drive storage looks healthy."
      );
    }

    const score = Math.max(
      100 - Math.floor(storageUsedMB / 1000),
      10
    );

    return res.json({
      success: true,
      health: {
        score,
        suggestions,
      },
    });

  } catch (err) {
    console.error("Storage Health Error:", err);

    return res.status(500).json({
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
