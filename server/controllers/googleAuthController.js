const { google } = require("googleapis");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const googleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    const oauth2Client = new google.auth.OAuth2();

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    const { name, email, picture } = data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        profilePicture: picture,
      });
    }

    // Save Google Access Token
    user.accessToken = accessToken;
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user,
    });

  } catch (err) {
    console.error(err);

    res.status(401).json({
      success: false,
      message: "Google Authentication Failed",
    });
  }
};

module.exports = {
  googleLogin,
};