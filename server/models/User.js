const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      default: "google",
    },

    // Store Google Access Token
    accessToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);