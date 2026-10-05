import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Folder,
  FileText,
  Image,
  Video,
  File,
  Loader2,
} from "lucide-react";

import { getDriveAnalytics } from "../services/driveApi";

// ==========================================
// FILE ICON
// ==========================================

const getFileIcon = (file) => {
  if (
    file.mimeType ===
    "application/vnd.google-apps.folder"
  ) {
    return <Folder className="h-5 w-5" />;
  }

  if (file.mimeType === "application/pdf") {
    return <FileText className="h-5 w-5" />;
  }

  if (file.mimeType?.startsWith("image/")) {
    return <Image className="h-5 w-5" />;
  }

  if (file.mimeType?.startsWith("video/")) {
    return <Video className="h-5 w-5" />;
  }

  return <File className="h-5 w-5" />;
};

// ==========================================
// OPEN FILE / FOLDER IN GOOGLE DRIVE
// ==========================================

const openDriveFile = (file) => {
  if (!file?.id) return;

  const isFolder =
    file.mimeType ===
    "application/vnd.google-apps.folder";

  const url = isFolder
    ? `https://drive.google.com/drive/folders/${file.id}`
    : `https://drive.google.com/file/d/${file.id}/view`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
};

// ==========================================
// FORMAT DATE
// ==========================================

const formatDate = (value) => {
  if (!value) {
    return "Unknown date";
  }

  return new Date(value).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// ==========================================
// FORMAT SIZE
// ==========================================

const formatSize = (size) => {
  const bytes = Number(size || 0);

  if (!bytes) {
    return "—";
  }

  if (
    bytes >=
    1024 * 1024 * 1024
  ) {
    return `${(
      bytes /
      1024 /
      1024 /
      1024
    ).toFixed(2)} GB`;
  }

  if (
    bytes >=
    1024 * 1024
  ) {
    return `${(
      bytes /
      1024 /
      1024
    ).toFixed(2)} MB`;
  }

  if (bytes >= 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${bytes} B`;
};

// ==========================================
// PAGE
// ==========================================

function DriveRecent() {
  const navigate = useNavigate();

  const [files, setFiles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD ALL RECENT FILES
  // ==========================================

  useEffect(() => {
    const loadRecentFiles =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getDriveAnalytics();

          setFiles(
            response.analytics
              ?.recentFiles || []
          );
        } catch (err) {
          console.error(
            "Recent Files Error:",
            err
          );

          setError(
            err.response?.data
              ?.message ||
              "Unable to load recent files."
          );
        } finally {
          setLoading(false);
        }
      };

    loadRecentFiles();
  }, []);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09090b] via-[#0d0d10] to-[#09090b] text-white">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]/90 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">

          <div>
            <h1 className="text-xl font-semibold">
              Recent Files
            </h1>

            <p className="text-xs text-zinc-500">
              All recently modified files and folders
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Dashboard
          </button>

        </div>

      </header>

      {/* ========================================
          MAIN
      ======================================== */}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

        {/* COUNT */}

        <div className="mb-6">

          <p className="text-sm text-zinc-500">

            {loading
              ? "Loading..."
              : `${files.length.toLocaleString()} items found`}

          </p>

        </div>

        {/* ======================================
            LOADING
        ====================================== */}

        {loading && (
          <div className="flex min-h-60 items-center justify-center">

            <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />

          </div>
        )}

        {/* ======================================
            ERROR
        ====================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5 text-sm text-red-300">

            {error}

          </div>
        )}

        {/* ======================================
            EMPTY
        ====================================== */}

        {!loading &&
          !error &&
          files.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-zinc-500">

              No recent files found.

            </div>
          )}

        {/* ======================================
            ALL RECENT FILES
        ====================================== */}

        {!loading &&
          !error &&
          files.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">

              <div className="divide-y divide-white/5">

                {files.map(
                  (file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 transition hover:bg-white/[0.04]"
                    >

                      {/* ICON */}

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400">

                        {getFileIcon(
                          file
                        )}

                      </div>

                      {/* NAME + DATE */}

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-zinc-200">

                          {file.name}

                        </p>

                        <p className="mt-1 text-xs text-zinc-500">

                          Modified{" "}
                          {formatDate(
                            file.modifiedTime
                          )}

                        </p>

                      </div>

                      {/* SIZE */}

                      <div className="hidden shrink-0 text-xs text-zinc-500 md:block">

                        {formatSize(
                          file.size
                        )}

                      </div>

                      {/* OPEN */}

                      <button
                        type="button"
                        onClick={() =>
                          openDriveFile(
                            file
                          )
                        }
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                      >

                        <ExternalLink className="h-3.5 w-3.5" />

                        Open

                      </button>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

      </main>

    </div>
  );
}

export default DriveRecent;