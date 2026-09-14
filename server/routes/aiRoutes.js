const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const { storageHealth } = require("../controllers/aiController");

router.get("/health", verifyToken, storageHealth);

module.exports = router;