const crypto = require("crypto");
const { google } = require("googleapis");

// ============================================================
// CREATE GOOGLE DRIVE CLIENT
// ============================================================

const createDriveClient = (
  accessToken,
  refreshToken
) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.drive({
    version: "v3",
    auth,
  });
};

// ============================================================
// GOOGLE WORKSPACE EXPORT TYPES
// ============================================================

const getWorkspaceExportMimeType = (mimeType) => {
  const formats = {
    "application/vnd.google-apps.document":
      "text/plain",

    "application/vnd.google-apps.spreadsheet":
      "text/csv",

    "application/vnd.google-apps.presentation":
      "text/plain",
  };

  return formats[mimeType] || null;
};

// ============================================================
// SHA256 HASH
// ============================================================

const createHash = (buffer) => {
  return crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");
};

// ============================================================
// HASH GOOGLE WORKSPACE FILE
// ============================================================

const getWorkspaceContentHash = async (
  drive,
  file
) => {
  const exportMimeType =
    getWorkspaceExportMimeType(
      file.mimeType
    );

  if (!exportMimeType) {
    return null;
  }

  try {
    const response =
      await drive.files.export(
        {
          fileId: file.id,
          mimeType: exportMimeType,
        },
        {
          responseType: "arraybuffer",
        }
      );

    return createHash(
      Buffer.from(response.data)
    );
  } catch (err) {
    console.log(
  "Workspace file could not be exported:",
  file.name
);

    return null;
  }
};

// ============================================================
// ADD WORKSPACE CONTENT HASHES
// ============================================================

const addWorkspaceContentHashes = async (
  drive,
  files
) => {
  const workspaceFiles =
    files.filter((file) =>
      getWorkspaceExportMimeType(
        file.mimeType
      )
    );

  console.log(
    "WORKSPACE FILES:",
    workspaceFiles.length
  );

  if (workspaceFiles.length === 0) {
    return;
  }

  const concurrency = 5;

  for (
    let i = 0;
    i < workspaceFiles.length;
    i += concurrency
  ) {
    const batch =
      workspaceFiles.slice(
        i,
        i + concurrency
      );

    await Promise.all(
      batch.map(async (file) => {
        const hash =
          await getWorkspaceContentHash(
            drive,
            file
          );

        if (hash) {
          file.contentHash = hash;
        }
      })
    );
  }
};

// ============================================================
// DOWNLOAD NORMAL FILE AND HASH IT
// ============================================================

const getBinaryFileHash = async (
  drive,
  file
) => {
  try {
    const response =
      await drive.files.get(
        {
          fileId: file.id,
          alt: "media",
        },
        {
          responseType: "arraybuffer",
        }
      );

    return createHash(
      Buffer.from(response.data)
    );
  } catch (err) {
    console.error(
      "Binary hash failed:",
      file.name,
      err.message
    );

    return null;
  }
};

// ============================================================
// FALLBACK HASHING
//
// Some normal files may not have md5Checksum.
// We only download files that share the same size.
//
// This prevents downloading hundreds of files unnecessarily.
// ============================================================

const addFallbackBinaryHashes = async (
  drive,
  files
) => {
  const sizeGroups = {};

  files.forEach((file) => {
    // Ignore folders
    if (
      file.mimeType ===
      "application/vnd.google-apps.folder"
    ) {
      return;
    }

    // Workspace files are handled separately
    if (
      getWorkspaceExportMimeType(
        file.mimeType
      )
    ) {
      return;
    }

    // Already has Drive MD5
    if (file.md5Checksum) {
      return;
    }

    const size =
      Number(file.size || 0);

    if (size <= 0) {
      return;
    }

    if (!sizeGroups[size]) {
      sizeGroups[size] = [];
    }

    sizeGroups[size].push(file);
  });

  const candidates = [];

  Object.values(sizeGroups).forEach(
    (group) => {
      if (group.length >= 2) {
        candidates.push(...group);
      }
    }
  );

  console.log(
    "FALLBACK HASH CANDIDATES:",
    candidates.length
  );

  if (candidates.length === 0) {
    return;
  }

  const concurrency = 3;

  for (
    let i = 0;
    i < candidates.length;
    i += concurrency
  ) {
    const batch =
      candidates.slice(
        i,
        i + concurrency
      );

    await Promise.all(
      batch.map(async (file) => {
        const hash =
          await getBinaryFileHash(
            drive,
            file
          );

        if (hash) {
          file.contentHash = hash;
        }
      })
    );
  }
};

// ============================================================
// CONVERT DRIVE FILE
// ============================================================

const convertDriveFile = (file) => {
  return {
    id: file.id,

    name:
      file.name ||
      "Unnamed file",

    size:
      Number(file.size || 0),

    mimeType:
      file.mimeType ||
      "Unknown",

    modifiedTime:
      file.modifiedTime ||
      null,

    md5Checksum:
      file.md5Checksum ||
      null,

    contentHash:
      file.contentHash ||
      null,

    // ========================================
    // OWNERSHIP
    // ========================================

    ownedByMe:
      file.ownedByMe === true,

    owner:
      file.ownedByMe === true
        ? "You"
        : file.owners?.[0]
            ?.emailAddress ||
          "Unknown owner",

    ownerName:
      file.ownedByMe === true
        ? "You"
        : file.owners?.[0]
            ?.displayName ||
          "Unknown owner",

    // ========================================
    // PERMISSION
    // ========================================

    canTrash:
      file.ownedByMe === true &&
      file.capabilities?.canTrash === true,

    canDownload:
      file.capabilities
        ?.canDownload === true,

    // ========================================
    // LINKS
    // ========================================

    webViewLink:
      file.webViewLink ||
      null,

    webContentLink:
      file.webContentLink ||
      null,
  };
};
// ============================================================
// GET RECENT DRIVE FILES - LIGHTWEIGHT
// ============================================================

const getRecentDriveFiles = async (
  accessToken,
  refreshToken,
  limit = 10
) => {
  const drive = createDriveClient(
    accessToken,
    refreshToken
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    20
  );

  const response = await drive.files.list({
    pageSize: safeLimit,

    q: "trashed = false",

    spaces: "drive",

    orderBy: "modifiedTime desc",

    fields:
      "files(" +
      "id," +
      "name," +
      "size," +
      "mimeType," +
      "modifiedTime," +
      "ownedByMe," +
      "owners(displayName,emailAddress)," +
      "webViewLink," +
      "webContentLink," +
      "capabilities(canTrash,canDownload)" +
      ")",
  });

  return (response.data.files || [])
    .map(convertDriveFile)
    .filter((file) => file.ownedByMe === true);
};
// ============================================================
// GET ALL DRIVE FILES - FOR MY FILES PAGE
// ============================================================

const getDriveFiles = async (
  accessToken,
  refreshToken,
  limit = 100
) => {
  const drive = createDriveClient(
    accessToken,
    refreshToken
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    100
  );

  const response = await drive.files.list({
    pageSize: safeLimit,

    q: "trashed = false",

    spaces: "drive",

    orderBy: "modifiedTime desc",

    fields:
      "files(" +
      "id," +
      "name," +
      "size," +
      "mimeType," +
      "modifiedTime," +
      "md5Checksum," +
      "ownedByMe," +
      "owners(displayName,emailAddress)," +
      "webViewLink," +
      "webContentLink," +
      "capabilities(canTrash,canDownload)" +
      ")",
  });

  return (response.data.files || []).map(
    convertDriveFile
  );
};
// ============================================================
// GET DRIVE ANALYTICS
// ============================================================

const getDriveAnalytics = async (
  accessToken,
  refreshToken,
  includeDuplicates = false
) => {
  const drive =
    createDriveClient(
      accessToken,
      refreshToken
    );

  // ==========================================================
  // GET ALL NON-TRASHED FILES
  // ==========================================================

  let files = [];
  let pageToken = null;

  do {
    const response =
      await drive.files.list({
        pageSize: 1000,

        pageToken,

        // Include everything except Trash
        q: "trashed = false",

        // Important for shared files
        spaces: "drive",

        fields:
          "nextPageToken,files(" +
          "id," +
          "name," +
          "size," +
          "mimeType," +
          "modifiedTime," +
          "md5Checksum," +
          "ownedByMe," +
          "owners(displayName,emailAddress)," +
          "webViewLink," +
          "webContentLink," +
          "shared," +
          "capabilities(canTrash,canDownload)" +
          ")",

        orderBy:
          "modifiedTime desc",
      });

    files =
      files.concat(
        response.data.files || []
      );

    pageToken =
      response.data.nextPageToken ||
      null;
  } while (pageToken);

  console.log(
    "===================================="
  );

  console.log(
    "DRIVE FILE COUNT:",
    files.length
  );

  console.log(
    "===================================="
  );

  // ==========================================================
  // STORAGE
  // ==========================================================

  const quotaResponse =
    await drive.about.get({
      fields:
        "storageQuota",
    });

  const storageQuota =
    quotaResponse.data
      .storageQuota || {};

  const storageUsedBytes =
    Number(
      storageQuota.usage || 0
    );

  const storageLimitBytes =
    Number(
      storageQuota.limit || 0
    );

  // ==========================================================
  // STATISTICS
  // ==========================================================

  let totalStorage = 0;
  let images = 0;
  let videos = 0;
  let pdfs = 0;
  let folders = 0;

  files.forEach((file) => {
    totalStorage += Number(
      file.size || 0
    );

    if (
      file.mimeType?.startsWith(
        "image/"
      )
    ) {
      images++;
    } else if (
      file.mimeType?.startsWith(
        "video/"
      )
    ) {
      videos++;
    } else if (
      file.mimeType ===
      "application/pdf"
    ) {
      pdfs++;
    } else if (
      file.mimeType ===
      "application/vnd.google-apps.folder"
    ) {
      folders++;
    }
  });

  // ==========================================================
  // LARGEST FILES
  // ==========================================================

  const largestFiles =
    [...files]
      .filter(
        (file) =>
          file.size &&
          Number(file.size) > 0
      )
      .sort(
        (a, b) =>
          Number(b.size) -
          Number(a.size)
      )
      .map(convertDriveFile);
      // ==========================================================
// OLD FILES
// Files not modified for 180+ days
// ==========================================================

const OLD_FILE_DAYS = 180;

const oldFileCutoff =
  Date.now() -
  OLD_FILE_DAYS *
    24 *
    60 *
    60 *
    1000;

const oldFiles =
  [...files]
    .filter((file) => {
      // Only files owned by the user can be cleaned up
      if (file.ownedByMe !== true) {
        return false;
      }

      // Folders are not cleanup candidates
      if (
        file.mimeType ===
        "application/vnd.google-apps.folder"
      ) {
        return false;
      }

      if (!file.modifiedTime) {
        return false;
      }

      return (
        new Date(file.modifiedTime).getTime() <
        oldFileCutoff
      );
    })
    .filter(
      (file) =>
        file.size &&
        Number(file.size) > 0
    )
    .sort(
      (a, b) =>
        new Date(a.modifiedTime) -
        new Date(b.modifiedTime)
    )
    .map(convertDriveFile);

  // ==========================================================
  // DUPLICATE SCAN
  // ==========================================================

  let allDuplicateGroups = [];
  let ownedDuplicates = [];
  let sharedDuplicates = [];
  let mixedDuplicates = [];
  let duplicateCopies = 0;

  if (includeDuplicates) {

  console.log(
    "===================================="
  );

  console.log(
    "STARTING CONTENT DUPLICATE SCAN"
  );

  console.log(
    "===================================="
  );

  // ==========================================================
  // GOOGLE DOCS / SHEETS / SLIDES
  // ==========================================================

  await addWorkspaceContentHashes(
    drive,
    files
  );

  // ==========================================================
  // NORMAL FILES
  // ==========================================================

  await addFallbackBinaryHashes(
    drive,
    files
  );

  // ==========================================================
  // BUILD CONTENT HASH MAP
  //
  // IMPORTANT:
  // Filename is NEVER used.
  //
  // Example:
  //
  // abc.pdf
  // xyz.pdf
  // final-copy.pdf
  //
  // If content is identical,
  // all three get the same hash.
  // ==========================================================

  const contentHashMap = {};

  let filesWithHash = 0;
  let filesWithoutHash = 0;

  files.forEach((file) => {
    // Never treat folders as duplicates
    if (
      file.mimeType ===
      "application/vnd.google-apps.folder"
    ) {
      return;
    }

    const contentHash =
      file.md5Checksum ||
      file.contentHash;

    if (!contentHash) {
      filesWithoutHash++;
      return;
    }

    filesWithHash++;

    if (
      !contentHashMap[
        contentHash
      ]
    ) {
      contentHashMap[
        contentHash
      ] = [];
    }

    contentHashMap[
      contentHash
    ].push(file);
  });

  console.log(
    "FILES WITH HASH:",
    filesWithHash
  );

  console.log(
    "FILES WITHOUT HASH:",
    filesWithoutHash
  );

  // ==========================================================
  // DUPLICATE GROUPS
  // ==========================================================

    ownedDuplicates = [];
    sharedDuplicates = [];
    mixedDuplicates = [];

  // This contains EVERY duplicate group
    allDuplicateGroups = [];

  Object.entries(
    contentHashMap
  ).forEach(
    ([hash, matchingFiles]) => {
      // Need at least 2 files
      if (
        matchingFiles.length < 2
      ) {
        return;
      }

      // ======================================================
      // OWNED
      // ======================================================

      const ownedFiles =
        matchingFiles.filter(
          (file) =>
            file.ownedByMe === true
        );

      // ======================================================
      // SHARED
      // ======================================================

      const sharedFiles =
        matchingFiles.filter(
          (file) =>
            file.ownedByMe !== true
        );

      // ======================================================
      // CONVERT
      // ======================================================

      const convertedFiles =
        matchingFiles.map(
          convertDriveFile
        );

      // ======================================================
      // GROUP OBJECT
      // ======================================================

      const group = {
        // Use first filename only as display name.
        // NOT used for duplicate detection.
        name:
          matchingFiles[0].name ||
          "Identical content",

        hash,

        count:
          matchingFiles.length,

        ownedCount:
          ownedFiles.length,

        sharedCount:
          sharedFiles.length,

        files:
          convertedFiles,
      };

      // ======================================================
      // ALL DUPLICATES
      // ======================================================

      allDuplicateGroups.push(
        group
      );

      // ======================================================
      // ONLY YOUR DUPLICATES
      // ======================================================

      if (
        ownedFiles.length >= 2
      ) {
        ownedDuplicates.push({
          ...group,

          files:
            ownedFiles.map(
              convertDriveFile
            ),
        });
      }

      // ======================================================
      // ONLY SHARED DUPLICATES
      // ======================================================

      if (
        sharedFiles.length >= 2
      ) {
        sharedDuplicates.push({
          ...group,

          files:
            sharedFiles.map(
              convertDriveFile
            ),
        });
      }

      // ======================================================
      // MIXED DUPLICATES
      //
      // Example:
      //
      // abc.pdf       -> You
      // xyz.pdf       -> Someone else
      //
      // Same content.
      // ======================================================

      if (
        ownedFiles.length > 0 &&
        sharedFiles.length > 0
      ) {
        mixedDuplicates.push(
          group
        );
      }
    }
  );

  // ==========================================================
  // SORT DUPLICATES
  // ==========================================================

  const sortDuplicates =
    (a, b) =>
      b.count - a.count;

  allDuplicateGroups.sort(
    sortDuplicates
  );

  ownedDuplicates.sort(
    sortDuplicates
  );

  sharedDuplicates.sort(
    sortDuplicates
  );

  mixedDuplicates.sort(
    sortDuplicates
  );

  // ==========================================================
  // DUPLICATE COPY COUNT
  // ==========================================================

    duplicateCopies =
      allDuplicateGroups.reduce(
      (total, group) => {
        return (
          total +
          group.count -
          1
        );
      },
      0
    );

  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log(
    "===================================="
  );

  console.log(
    "ALL DUPLICATE GROUPS:",
    allDuplicateGroups.length
  );

  console.log(
    "OWNED DUPLICATE GROUPS:",
    ownedDuplicates.length
  );

  console.log(
    "SHARED DUPLICATE GROUPS:",
    sharedDuplicates.length
  );

  console.log(
    "MIXED DUPLICATE GROUPS:",
    mixedDuplicates.length
  );

  console.log(
    "DUPLICATE FILE COPIES:",
    duplicateCopies
  );

  console.log(
    "===================================="
  );

  }

  // ==========================================================
  // RECENT FILES
  // ==========================================================

  const recentFiles =
    [...files]
      .sort(
        (a, b) =>
          new Date(
            b.modifiedTime || 0
          ) -
          new Date(
            a.modifiedTime || 0
          )
      )
      .slice(0, 50)
      .map(convertDriveFile);

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    // ========================================================
    // STORAGE
    // ========================================================

    totalFiles:
      files.length,

    storageUsedMB:
      (
        storageUsedBytes /
        1024 /
        1024
      ).toFixed(2),

    storageUsedBytes,

    storageLimitBytes,

    storageQuota: {
      limit:
        storageLimitBytes,

      usage:
        storageUsedBytes,
    },

    // ========================================================
    // STATISTICS
    // ========================================================

    images,

    videos,

    pdfs,

    folders,

    totalStorage,

    // ========================================================
    // FILE LISTS
    // ========================================================

    recentFiles,

    largestFiles,
   

    // ========================================================
    // DUPLICATES
    // ========================================================

    duplicateFiles:
      allDuplicateGroups,

    allDuplicateGroups,

    ownedDuplicates,

    sharedDuplicates,

    mixedDuplicates,

    duplicateGroupCount:
      allDuplicateGroups.length,

    duplicateCopies,
  };
};

// ============================================================
// MOVE DRIVE FILES TO TRASH
// ============================================================

const deleteDriveFiles = async (
  accessToken,
  refreshToken,
  fileIds
) => {
  const drive =
    createDriveClient(
      accessToken,
      refreshToken
    );

  let deleted = 0;

  const failed = [];

  for (
    const fileId of fileIds
  ) {
    try {
      console.log(
        "===================================="
      );

      console.log(
        "MOVING DRIVE FILE TO TRASH:",
        fileId
      );

      // ======================================================
      // GET FILE
      // ======================================================

      const fileResponse =
        await drive.files.get({
          fileId,

          fields:
            "id,name,mimeType,trashed,ownedByMe,capabilities(canTrash)",

          supportsAllDrives:
            true,
        });

      const file =
        fileResponse.data;

      // ======================================================
      // ALREADY TRASHED
      // ======================================================

      if (
        file.trashed === true
      ) {
        deleted++;
        continue;
      }

      // ======================================================
      // NOT OWNED BY USER
      // ======================================================

      if (
        file.ownedByMe !== true
      ) {
        failed.push({
          id: fileId,

          name:
            file.name,

          reason:
            "File is owned by someone else.",
        });

        continue;
      }

      // ======================================================
      // CANNOT TRASH
      // ======================================================

      if (
        file.capabilities
          ?.canTrash !== true
      ) {
        failed.push({
          id: fileId,

          name:
            file.name,

          reason:
            "You do not have permission to move this file to Trash.",
        });

        continue;
      }

      // ======================================================
      // MOVE TO TRASH
      // ======================================================

      await drive.files.update({
        fileId,

        requestBody: {
          trashed: true,
        },

        fields:
          "id,name,trashed,ownedByMe",

        supportsAllDrives:
          true,
      });

      // ======================================================
      // VERIFY
      // ======================================================

      const verify =
        await drive.files.get({
          fileId,

          fields:
            "id,name,trashed,ownedByMe",

          supportsAllDrives:
            true,
        });

      if (
        verify.data.trashed ===
        true
      ) {
        deleted++;

        console.log(
          "SUCCESSFULLY MOVED TO TRASH:",
          file.name
        );
      } else {
        failed.push({
          id: fileId,

          name:
            file.name,

          reason:
            "Google Drive did not confirm Trash status.",
        });
      }
    } catch (err) {
      console.error(
        "DRIVE DELETE ERROR:",
        fileId,
        err.message
      );

      failed.push({
        id: fileId,

        reason:
          err.message,
      });
    }
  }

  return {
    deleted,

    failed,
  };
};

// ============================================================
// RESTORE DRIVE FILES
// ============================================================

const restoreDriveFiles = async (
  accessToken,
  refreshToken,
  fileIds
) => {
  const drive =
    createDriveClient(
      accessToken,
      refreshToken
    );

  let restored = 0;

  const failed = [];

  for (
    const fileId of fileIds
  ) {
    try {
      const response =
        await drive.files.get({
          fileId,

          fields:
            "id,name,trashed,ownedByMe",

          supportsAllDrives:
            true,
        });

      // Only restore trashed files
      if (
        response.data.trashed !==
        true
      ) {
        continue;
      }

      // Only owner should restore
      if (
        response.data.ownedByMe !==
        true
      ) {
        failed.push({
          id: fileId,

          name:
            response.data.name,

          reason:
            "File is owned by someone else.",
        });

        continue;
      }

      await drive.files.update({
        fileId,

        requestBody: {
          trashed: false,
        },

        fields:
          "id,name,trashed",

        supportsAllDrives:
          true,
      });

      restored++;
    } catch (err) {
      console.error(
        "RESTORE ERROR:",
        fileId,
        err.message
      );

      failed.push({
        id: fileId,

        reason:
          err.message,
      });
    }
  }

  return {
    restored,

    failed,
  };
};

// ============================================================
// GET DRIVE TRASH
// ============================================================

const getDriveTrash = async (
  accessToken,
  refreshToken
) => {
  const drive =
    createDriveClient(
      accessToken,
      refreshToken
    );

  let files = [];

  let pageToken = null;

  do {
    const response =
      await drive.files.list({
        pageSize: 1000,

        pageToken,

        q: "trashed = true",

        spaces: "drive",

        fields:
          "nextPageToken,files(" +
          "id," +
          "name," +
          "size," +
          "mimeType," +
          "modifiedTime," +
          "trashed," +
          "ownedByMe," +
          "owners(displayName,emailAddress)," +
          "webViewLink" +
          ")",

        orderBy:
          "modifiedTime desc",
      });

    files =
      files.concat(
        response.data.files ||
          []
      );

    pageToken =
      response.data
        .nextPageToken ||
      null;
  } while (pageToken);

  return files.map(
    convertDriveFile
  );
};

// ============================================================
// EMPTY DRIVE TRASH
// ============================================================

const emptyDriveTrash = async (
  accessToken,
  refreshToken
) => {
  const drive =
    createDriveClient(
      accessToken,
      refreshToken
    );

  await drive.files.emptyTrash();

  return {
    success: true,
  };
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getDriveAnalytics,
  getDriveFiles,
  deleteDriveFiles,
  restoreDriveFiles,
  getRecentDriveFiles,
  getDriveTrash,
  emptyDriveTrash,
};