const { google } = require("googleapis");

// ==========================================
// Create Gmail Client
// ==========================================
const createGmailClient = (accessToken, refreshToken) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.gmail({
    version: "v1",
    auth,
  });
};

// ==========================================
// Gmail Profile
// ==========================================
const getGmailProfile = async (
  accessToken,
  refreshToken
) => {
  const gmail = createGmailClient(
    accessToken,
    refreshToken
  );

  const profile =
    await gmail.users.getProfile({
      userId: "me",
    });

  return {
    emailAddress:
      profile.data.emailAddress || "",

    messagesTotal:
      profile.data.messagesTotal || 0,

    threadsTotal:
      profile.data.threadsTotal || 0,
  };
};

// ==========================================
// Gmail Categories
// ==========================================
const getGmailCategories = async (
  accessToken,
  refreshToken
) => {
  const gmail = createGmailClient(
    accessToken,
    refreshToken
  );

  const labelsResponse =
    await gmail.users.labels.list({
      userId: "me",
    });

  const labels =
    labelsResponse.data.labels || [];

  const detailedLabels =
    await Promise.all(
      labels.map(async (label) => {
        const detail =
          await gmail.users.labels.get({
            userId: "me",
            id: label.id,
          });

        return {
          id: detail.data.id,
          name: detail.data.name,

          messages:
            detail.data.messagesTotal || 0,

          threads:
            detail.data.threadsTotal || 0,
        };
      })
    );

  return detailedLabels;
};

// ==========================================
// Largest Attachments
// ==========================================
const getLargestAttachments = async (
  accessToken,
  refreshToken
) => {
  const gmail = createGmailClient(
    accessToken,
    refreshToken
  );

  const messages =
    await gmail.users.messages.list({
      userId: "me",
      maxResults: 100,
    });

  if (!messages.data.messages) {
    return [];
  }

  const attachments = [];

  for (const message of messages.data.messages) {
    const mail =
      await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

    const parts =
      mail.data.payload?.parts || [];

    parts.forEach((part) => {
      if (
        part.filename &&
        part.filename.length > 0 &&
        part.body &&
        part.body.size
      ) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
        });
      }
    });
  }

  attachments.sort(
    (a, b) => b.size - a.size
  );

  return attachments.slice(0, 10);
};

// ==========================================
// Gmail Messages
// ==========================================
// ==========================================
// Gmail Messages
// ==========================================
const getGmailMessages = async (
  accessToken,
  refreshToken,
  type = "all",
  pageToken = null,
  limit = 100
) => {
  const gmail = createGmailClient(
    accessToken,
    refreshToken
  );

  // ==========================================
  // Gmail Queries
  // ==========================================

  const queries = {
    promotions:
      "category:promotions -in:trash",

    social:
      "category:social -in:trash",

    updates:
      "category:updates -in:trash",

    spam:
      "in:spam -in:trash",

    trash:
      "in:trash",

    all:
      "in:anywhere -in:trash",
  };

  const query =
    queries[type] || queries.all;

  console.log("====================================");
  console.log("GMAIL QUERY:", query);
  console.log("PAGE TOKEN:", pageToken);

  // ==========================================
  // Gmail Messages List
  // ==========================================

  const response =
    await gmail.users.messages.list({
      userId: "me",

      // 10 emails per page
      maxResults: Math.min(Number(limit) || 100, 100),

      q: query,

      // Used for page 2, 3, 4...
      ...(pageToken
        ? { pageToken }
        : {}),
    });

  const messageList =
    response.data.messages || [];

  // ==========================================
  // No messages
  // ==========================================

  if (messageList.length === 0) {
    return {
      messages: [],
      nextPageToken: null,
      resultSizeEstimate:
        response.data.resultSizeEstimate || 0,
    };
  }

  // ==========================================
  // Get message details
  // ==========================================

  const messages =
    await Promise.all(
      messageList.map(
        async (message) => {
          const detail =
            await gmail.users.messages.get({
              userId: "me",
              id: message.id,
              format: "metadata",

              metadataHeaders: [
                "Subject",
                "From",
                "Date",
              ],
            });

          const headers =
            detail.data.payload?.headers ||
            [];

          const getHeader = (name) => {
            const header =
              headers.find(
                (item) =>
                  item.name.toLowerCase() ===
                  name.toLowerCase()
              );

            return header?.value || "";
          };

          return {
            id: detail.data.id,

            threadId:
              detail.data.threadId,

            subject:
              getHeader("Subject"),

            from:
              getHeader("From"),

            date:
              getHeader("Date"),
          };
        }
      )
    );

  // ==========================================
  // Return pagination information
  // ==========================================

  return {
    messages,

    // Token for next page
    nextPageToken:
      response.data.nextPageToken || null,

    resultSizeEstimate:
      response.data.resultSizeEstimate || 0,
  };
};

// ==========================================
// Move Emails To Trash
// ==========================================
const moveEmailsToTrash = async (
  accessToken,
  refreshToken,
  messageIds
) => {
  const gmail = createGmailClient(
    accessToken,
    refreshToken
  );

  if (
    !Array.isArray(messageIds) ||
    messageIds.length === 0
  ) {
    throw new Error(
      "No email IDs were provided"
    );
  }

  let movedCount = 0;

  const failed = [];

  // Process each email
  for (const messageId of messageIds) {
    try {
      console.log(
        "===================================="
      );

      console.log(
        "MOVING GMAIL MESSAGE TO TRASH:",
        messageId
      );

      // --------------------------------------
      // Check message before moving
      // --------------------------------------

      const before =
        await gmail.users.messages.get({
          userId: "me",
          id: messageId,
          format: "metadata",
        });

      console.log(
        "LABELS BEFORE:",
        before.data.labelIds
      );

      // --------------------------------------
      // Move message to Trash
      // --------------------------------------

      await gmail.users.messages.trash({
        userId: "me",
        id: messageId,
      });

      // --------------------------------------
      // Verify message after moving
      // --------------------------------------

      const after =
        await gmail.users.messages.get({
          userId: "me",
          id: messageId,
          format: "metadata",
        });

      console.log(
        "LABELS AFTER:",
        after.data.labelIds
      );

      // --------------------------------------
      // Check TRASH label
      // --------------------------------------

      if (
        after.data.labelIds &&
        after.data.labelIds.includes("TRASH")
      ) {
        movedCount++;

        console.log(
          "SUCCESS - MESSAGE IS IN TRASH:",
          messageId
        );
      } else {
        failed.push({
          id: messageId,
          reason:
            "TRASH label was not found",
        });

        console.log(
          "FAILED - TRASH LABEL NOT FOUND:",
          messageId
        );
      }
    } catch (err) {
      console.error(
        "FAILED TO MOVE MESSAGE:",
        messageId,
        err.message
      );

      failed.push({
        id: messageId,
        reason: err.message,
      });
    }
  }

  // ========================================
  // Final Result
  // ========================================

  console.log(
    "===================================="
  );

  console.log(
    "TOTAL REQUESTED:",
    messageIds.length
  );

  console.log(
    "TOTAL MOVED:",
    movedCount
  );

  console.log(
    "TOTAL FAILED:",
    failed.length
  );

  return {
    success: movedCount > 0,
    movedCount,
    failed,
  };
};
// ==========================================
// Permanently Delete Emails
// ==========================================
// ==========================================
// Permanently Delete Gmail Emails
// ==========================================
const permanentlyDeleteEmails = async (
  accessToken,
  refreshToken,
  messageIds
) => {
  const gmail = createGmailClient(
    accessToken,
    refreshToken
  );

  if (
    !Array.isArray(messageIds) ||
    messageIds.length === 0
  ) {
    throw new Error(
      "No email IDs were provided"
    );
  }

  let deletedCount = 0;

  const failed = [];

  for (const messageId of messageIds) {
    try {
      console.log(
        "===================================="
      );

      console.log(
        "PERMANENT DELETE MESSAGE:",
        messageId
      );

      // ========================================
      // CHECK MESSAGE FIRST
      // ========================================

      const message =
        await gmail.users.messages.get({
          userId: "me",
          id: messageId,
          format: "metadata",
        });

      console.log(
        "MESSAGE FOUND:",
        message.data.id
      );

      console.log(
        "MESSAGE LABELS:",
        message.data.labelIds
      );

      // ========================================
      // CHECK WHETHER IT IS IN TRASH
      // ========================================

      const labels =
        message.data.labelIds || [];

      if (!labels.includes("TRASH")) {
        failed.push({
          id: messageId,

          reason:
            "Message is not currently in Gmail Trash.",
        });

        console.log(
          "NOT IN TRASH:",
          messageId
        );

        continue;
      }

      // ========================================
      // PERMANENT DELETE
      // ========================================

      await gmail.users.messages.delete({
        userId: "me",
        id: messageId,
      });

      deletedCount++;

      console.log(
        "SUCCESSFULLY PERMANENTLY DELETED:",
        messageId
      );
    } catch (err) {
      console.error(
        "FAILED TO PERMANENTLY DELETE:",
        messageId,
        err.message
      );

      failed.push({
        id: messageId,

        reason:
          err.response?.data?.error?.message ||
          err.message,
      });
    }
  }

  console.log(
    "===================================="
  );

  console.log(
    "PERMANENT DELETE SUMMARY"
  );

  console.log(
    "REQUESTED:",
    messageIds.length
  );

  console.log(
    "DELETED:",
    deletedCount
  );

  console.log(
    "FAILED:",
    failed.length
  );

  console.log(
    "FAILED DETAILS:",
    failed
  );

  console.log(
    "===================================="
  );

  return {
    success:
      deletedCount > 0,

    deletedCount,

    failed,
  };
};

// ==========================================
// Export Functions
// ==========================================
module.exports = {
  getGmailProfile,
  getGmailCategories,
  getLargestAttachments,
  getGmailMessages,
  moveEmailsToTrash,
  permanentlyDeleteEmails,
};