const express = require("express");
const router = express.Router();

const {
  createUser,
  getProfile,
} = require("../controllers/userController");

const verifyToken = require("../middleware/authMiddleware");

router.post("/register", createUser);

router.get("/profile", verifyToken, getProfile);

module.exports = router;