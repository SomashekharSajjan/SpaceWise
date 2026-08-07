const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register User
const createUser = async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: "User already exists",
        token,
        user,
      });
    }

    // Create new user
    user = await User.create({
      name,
      email,
      profilePicture,
    });

    // Generate JWT Token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Logged-in User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  getProfile,
};