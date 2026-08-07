const express = require("express");
const router = express.Router();

const { gmailProfile } = require("../controllers/gmailController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/profile", verifyToken, gmailProfile);

module.exports = router;