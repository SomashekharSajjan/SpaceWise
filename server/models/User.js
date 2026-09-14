const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER INFORMATION
    // ==========================================

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    // Google unique user ID
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      default: "google",
    },

    // ==========================================
    // GOOGLE OAUTH TOKENS
    // ==========================================

    accessToken: {
      type: String,
      default: "",
    },

    refreshToken: {
      type: String,
      default: "",
    },

    // ==========================================
    // GOOGLE AI PRO
    // ==========================================
    // IMPORTANT:
    // This must only be set to true when the
    // user's actual AI Pro subscription is
    // confirmed.
    // ==========================================

    googleAiPro: {
      type: Boolean,
      default: false,
    },

    googleAiProExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);