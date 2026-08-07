const { google } = require("googleapis");

const getGmailProfile = async (accessToken) => {
  const oauth2Client = new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const profile = await gmail.users.getProfile({
    userId: "me",
  });

  return profile.data;
};

module.exports = {
  getGmailProfile,
};