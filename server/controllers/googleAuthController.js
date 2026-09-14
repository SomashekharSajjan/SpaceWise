const { google } = require("googleapis");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ============================================================
// GOOGLE LOGIN
// ============================================================

const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // ========================================================
    // CHECK AUTHORIZATION CODE
    // ========================================================

    if (!code) {
      return res.status(400).json({
        success: false,
        message:
          "Google authorization code is required",
      });
    }

    // ========================================================
    // GOOGLE OAUTH CLIENT
    // ========================================================

    const oauth2Client =
      new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "postmessage"
      );

    // ========================================================
    // EXCHANGE CODE FOR GOOGLE TOKENS
    // ========================================================

    const { tokens } =
      await oauth2Client.getToken(code);

    console.log(
      "Google token received:",
      {
        hasAccessToken:
          !!tokens.access_token,

        hasRefreshToken:
          !!tokens.refresh_token,
      }
    );

    const {
      access_token,
      refresh_token,
    } = tokens;

    // ========================================================
    // CHECK ACCESS TOKEN
    // ========================================================

    if (!access_token) {
      return res.status(401).json({
        success: false,
        message:
          "Google access token was not received",
      });
    }

    // ========================================================
    // SET GOOGLE CREDENTIALS
    // ========================================================

    oauth2Client.setCredentials({
      access_token,
      refresh_token,
    });

    // ========================================================
    // GET GOOGLE USER INFORMATION
    // ========================================================

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } =
      await oauth2.userinfo.get();

    // ========================================================
    // GOOGLE USER DATA
    // ========================================================

    const googleId = data.id;

    const name =
      data.name || "Google User";

    const email = data.email;

    const picture =
      data.picture || "";

    console.log(
      "Google user information:",
      {
        googleId,
        email,
        name,
      }
    );

    // ========================================================
    // VALIDATE GOOGLE DATA
    // ========================================================

    if (!googleId) {
      return res.status(401).json({
        success: false,
        message:
          "Google ID was not received",
      });
    }

    if (!email) {
      return res.status(401).json({
        success: false,
        message:
          "Google email was not received",
      });
    }

    // ========================================================
    // FIND EXISTING USER
    // ========================================================
    // First try Google ID.
    // If not found, try email.
    // ========================================================

    let user =
      await User.findOne({
        $or: [
          {
            googleId: googleId,
          },
          {
            email: email,
          },
        ],
      });

    // ========================================================
    // CREATE NEW USER
    // ========================================================

    if (!user) {
      user =
        await User.create({
          name,
          email,
          googleId,
          profilePicture: picture,
          provider: "google",

          accessToken:
            access_token,

          refreshToken:
            refresh_token || "",

          // ================================================
          // AI PRO DEFAULT
          // ================================================
          // New users are NOT automatically marked as
          // Google AI Pro users.
          // ================================================

          googleAiPro: false,

          googleAiProExpiry: null,
        });

      console.log(
        "New Google user created:",
        email
      );
    }

    // ========================================================
    // UPDATE EXISTING USER
    // ========================================================

    else {
      // ------------------------------------------------------
      // GOOGLE ID
      // ------------------------------------------------------

      if (!user.googleId) {
        user.googleId = googleId;
      }

      // ------------------------------------------------------
      // BASIC GOOGLE INFORMATION
      // ------------------------------------------------------

      user.name = name;

      if (picture) {
        user.profilePicture =
          picture;
      }

      user.provider = "google";

      // ------------------------------------------------------
      // ALWAYS UPDATE ACCESS TOKEN
      // ------------------------------------------------------

      user.accessToken =
        access_token;

      // ------------------------------------------------------
      // REFRESH TOKEN
      // ------------------------------------------------------
      // Google may not return a refresh token on every login.
      // Therefore don't overwrite the existing one with "".
      // ------------------------------------------------------

      if (refresh_token) {
        user.refreshToken =
          refresh_token;
      }

      // ------------------------------------------------------
      // AI PRO VALUES ARE PRESERVED
      // ------------------------------------------------------
      // We intentionally DON'T set googleAiPro here.
      // If the user has been verified as AI Pro, the existing
      // value remains unchanged.
      // ------------------------------------------------------

      await user.save();

      console.log(
        "Existing Google user updated:",
        email
      );
    }

    // ========================================================
    // GENERATE SPACEWISE JWT
    // ========================================================

    const token =
      generateToken(user);

    // ========================================================
    // SEND USER DATA TO FRONTEND
    // ========================================================

    return res.json({
      success: true,

      token,

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

        profilePicture:
          user.profilePicture,

        // ================================================
        // GOOGLE AI PRO STATUS
        // ================================================

        googleAiPro:
          user.googleAiPro || false,

        googleAiProExpiry:
          user.googleAiProExpiry || null,
      },
    });
  } catch (err) {
    console.error(
      "Google Login Error:",
      err
    );

    return res.status(401).json({
      success: false,

      message:
        "Google Authentication Failed",

      error: err.message,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  googleLogin,
};