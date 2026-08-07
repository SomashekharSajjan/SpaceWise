const { google } = require("googleapis");

const getDriveFiles = async (accessToken) => {
  const auth = new google.auth.OAuth2();

  auth.setCredentials({
    access_token: accessToken,
  });

  const drive = google.drive({
    version: "v3",
    auth,
  });

  const response = await drive.files.list({
    pageSize: 100,
    fields: "files(id,name,size,mimeType)",
  });

  return response.data.files;
};

module.exports = {
  getDriveFiles,
};