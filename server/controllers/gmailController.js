const User = require("../models/User");
const { getGmailProfile } = require("../services/gmailService");

const gmailProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const profile = await getGmailProfile(user.accessToken);

    res.json({
      success: true,
      profile,
    });
  } catch (err) {
  console.error("Gmail Error:");
  console.error(err);

  if (err.response) {
    console.error(err.response.data);
  }

  res.status(500).json({
    success: false,
    message: err.message,
  });
}
};

module.exports = {
  gmailProfile,
};