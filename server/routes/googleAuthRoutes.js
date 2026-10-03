
const express = require("express");
const router = express.Router();

const { googleLogin, connectGoogleServices } = require("../controllers/googleAuthController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/google-login", googleLogin);
router.post("/connect-google-services", verifyToken, connectGoogleServices);

module.exports = router;
