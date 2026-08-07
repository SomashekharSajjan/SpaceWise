const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const { driveFiles } = require("../controllers/driveController");

router.get("/files", verifyToken, driveFiles);

module.exports = router;