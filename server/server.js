require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const gmailRoutes = require("./routes/gmailRoutes");
const driveRoutes = require("./routes/driveRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/drive", driveRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 SpaceWise Backend Running Successfully"
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err.message);
  });