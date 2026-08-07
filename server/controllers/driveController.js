const User = require("../models/User");
const { getDriveFiles } = require("../services/driveService");

const driveFiles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const files = await getDriveFiles(user.accessToken);

    let totalSize = 0;

    files.forEach((file) => {
      totalSize += Number(file.size || 0);
    });

    res.json({
      success: true,
      totalFiles: files.length,
      storageUsed: (totalSize / 1024 / 1024).toFixed(2),
      files,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  driveFiles,
};