import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  HardDrive,
  Trash2,
  ExternalLink,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  Sparkles,
  Files,
  ShieldCheck,
  Zap,
  X,
} from "lucide-react";

const API_URL = "";

// ============================================================
// FORMAT FILE SIZE
// ============================================================

const formatSize = (bytes) => {
  const size = Number(bytes || 0);

  if (!size) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];

  const index = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  );

  const value =
    size / Math.pow(1024, index);

  return `${value.toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
};

// ============================================================
// GET FILE TYPE
// ============================================================

const getFileType = (file) => {
  const mime = file?.mimeType || "";

  if (
    mime ===
    "application/vnd.google-apps.folder"
  ) {
    return "folder";
  }

  if (mime.startsWith("image/")) {
    return "image";
  }

  if (mime.startsWith("video/")) {
    return "video";
  }

  if (mime === "application/pdf") {
    return "pdf";
  }

  if (
    mime.includes("document") ||
    mime.includes("spreadsheet") ||
    mime.includes("presentation") ||
    mime.includes("text")
  ) {
    return "document";
  }

  return "file";
};

// ============================================================
// MAIN COMPONENT
// ============================================================

function DriveCleanup() {
  const navigate = useNavigate();

  // ==========================================================
  // STATES
  // ==========================================================

  const [files, setFiles] = useState([]);

  const [selected, setSelected] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [previewFile, setPreviewFile] =
    useState(null);

  // ==========================================================
  // LOAD LARGEST DRIVE FILES
  // ==========================================================

  const loadDriveFiles = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response =
        await axios.get(
          `${API_URL}/api/drive/analytics`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

      console.log(
        "DRIVE ANALYTICS RESPONSE:",
        response.data
      );

      const largestFiles =
        response.data?.analytics
          ?.largestFiles || [];

      setFiles(largestFiles);
    } catch (err) {
      console.error(
        "DRIVE CLEANUP LOAD ERROR:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        navigate("/login");

        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load Drive files."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadDriveFiles();
  }, []);

  // ==========================================================
  // OWNED / SHARED
  // ==========================================================

  const ownedFiles = useMemo(
    () =>
      files.filter(
        (file) =>
          file.ownedByMe === true
      ),
    [files]
  );

  const sharedFiles = useMemo(
    () =>
      files.filter(
        (file) =>
          file.ownedByMe !== true
      ),
    [files]
  );

  // ==========================================================
  // TOTAL SIZE
  // ==========================================================

  const totalLargeFileSize =
    useMemo(
      () =>
        files.reduce(
          (total, file) =>
            total +
            Number(file.size || 0),
          0
        ),
      [files]
    );

  const ownedLargeFileSize =
    useMemo(
      () =>
        ownedFiles.reduce(
          (total, file) =>
            total +
            Number(file.size || 0),
          0
        ),
      [ownedFiles]
    );

  // ==========================================================
  // SELECT / UNSELECT FILE
  // ==========================================================

  const toggleFile = (fileId) => {
    const file = files.find(
      (item) => item.id === fileId
    );

    // Shared files cannot be selected
    if (
      !file ||
      file.ownedByMe !== true
    ) {
      return;
    }

    setSelected((previous) => {
      if (
        previous.includes(fileId)
      ) {
        return previous.filter(
          (id) => id !== fileId
        );
      }

      return [
        ...previous,
        fileId,
      ];
    });
  };

  // ==========================================================
  // SELECT ALL OWNED
  // ==========================================================

  const toggleSelectAll = () => {
    if (ownedFiles.length === 0) {
      return;
    }

    const allSelected =
      selected.length ===
        ownedFiles.length &&
      ownedFiles.every((file) =>
        selected.includes(file.id)
      );

    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(
        ownedFiles.map(
          (file) => file.id
        )
      );
    }
  };

  // ==========================================================
  // OPEN GOOGLE DRIVE
  // ==========================================================

  const openDriveFile = (file) => {
    if (file?.webViewLink) {
      window.open(
        file.webViewLink,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    if (file?.id) {
      window.open(
        `https://drive.google.com/open?id=${encodeURIComponent(
          file.id
        )}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  // ==========================================================
  // PREVIEW
  // ==========================================================

  const previewDriveFile = (file) => {
    if (!file?.id) {
      setError(
        "Unable to preview this file."
      );

      return;
    }

    setPreviewFile(file);
  };

  // ==========================================================
  // PREVIEW URL
  // ==========================================================

  const getPreviewUrl = (file) => {
    if (!file?.id) {
      return "";
    }

    return `https://drive.google.com/file/d/${encodeURIComponent(
      file.id
    )}/preview`;
  };

  // ==========================================================
  // START DELETE
  // ==========================================================

  const handleDelete = () => {
    if (selected.length === 0) {
      return;
    }

    setError("");
    setSuccess("");
    setShowConfirm(true);
  };

  // ==========================================================
  // CONFIRM DELETE
  // ==========================================================

  const confirmDelete = async () => {
    if (selected.length === 0) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const deleteCount =
        selected.length;

      const response =
        await axios.delete(
          "/api/drive/files",
          {
            headers: {
              Authorization: token,
            },

            data: {
              fileIds: selected,
            },
          }
        );

      console.log(
        "DRIVE DELETE RESPONSE:",
        response.data
      );

      if (response.data?.success) {
        setSuccess(
          response.data.message ||
            `${deleteCount} file${
              deleteCount === 1
                ? ""
                : "s"
            } moved to Trash successfully.`
        );

        setSelected([]);
        setShowConfirm(false);

        if (
          previewFile &&
          selected.includes(
            previewFile.id
          )
        ) {
          setPreviewFile(null);
        }

        await loadDriveFiles();
      } else {
        setError(
          response.data?.message ||
            "No files were moved to Trash."
        );
      }
    } catch (err) {
      console.error(
        "Drive Delete Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete Drive files."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // ESCAPE KEY
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewFile(null);
        setShowConfirm(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // ==========================================================
  // SELECT ALL STATUS
  // ==========================================================

  const allOwnedSelected =
    ownedFiles.length > 0 &&
    selected.length ===
      ownedFiles.length &&
    ownedFiles.every((file) =>
      selected.includes(file.id)
    );

  // ==========================================================
  // FILE CARD
  // ==========================================================

  const FileCard = ({
    file,
    owned,
  }) => {
    const isSelected =
      selected.includes(file.id);

    return (
      <div
        className={`
          border-b
          border-white/[0.07]
          p-4
          transition
          last:border-b-0

          ${
            owned
              ? "hover:bg-white/[0.025]"
              : "hover:bg-white/[0.015]"
          }
        `}
      >

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
          "
        >

          {/* CHECKBOX */}

          <input
            type="checkbox"
            checked={
              owned && isSelected
            }
            disabled={!owned}
            onChange={() =>
              toggleFile(file.id)
            }
            className={`
              h-4
              w-4
              shrink-0

              ${
                owned
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-30"
              }
            `}
          />

          {/* FILE ICON */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              text-zinc-400
            "
          >
            <HardDrive className="h-5 w-5" />
          </div>

          {/* FILE INFORMATION */}

          <div className="min-w-0 flex-1">

            <p
              className="
                truncate
                text-sm
                font-medium
                text-zinc-200
              "
              title={file.name}
            >
              {file.name ||
                "Unnamed file"}
            </p>

            <p
              className="
                mt-1
                truncate
                text-[10px]
                text-zinc-600
              "
            >
              {file.mimeType ||
                "Unknown type"}
            </p>

            {owned ? (
              <p
                className="
                  mt-2
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  text-emerald-400
                "
              >
                <ShieldCheck className="h-3 w-3" />

                Owned by you
              </p>
            ) : (
              <p
                className="
                  mt-2
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  text-yellow-400
                "
              >
                <Lock className="h-3 w-3" />

                Shared by someone
              </p>
            )}

          </div>

          {/* FILE SIZE */}

          <div
            className="
              shrink-0
              text-left
              sm:text-right
            "
          >
            <p
              className="
                text-sm
                font-semibold
                text-zinc-200
              "
            >
              {formatSize(
                file.size
              )}
            </p>

            <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-700">
              file size
            </p>
          </div>

          {/* ACTIONS */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >

            {/* PREVIEW */}

            <button
              type="button"
              onClick={() =>
                previewDriveFile(file)
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-blue-400/15
                bg-blue-400/[0.04]
                px-3
                py-2
                text-[10px]
                font-medium
                text-blue-300
                transition
                hover:border-blue-400/30
                hover:bg-blue-400/[0.08]
              "
            >
              <Eye className="h-3.5 w-3.5" />

              Preview
            </button>

            {/* OPEN */}

            <button
              type="button"
              onClick={() =>
                openDriveFile(file)
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-white/[0.08]
                bg-white/[0.02]
                px-3
                py-2
                text-[10px]
                font-medium
                text-zinc-300
                transition
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              <ExternalLink className="h-3.5 w-3.5" />

              Open
            </button>

          </div>

        </div>

        {/* SHARED WARNING */}

        {!owned && (
          <div
            className="
              ml-8
              mt-3
              flex
              items-center
              gap-2
              text-[10px]
              text-yellow-500/70
            "
          >
            <Lock className="h-3 w-3" />

            Shared file — you cannot
            move this file to Trash.
          </div>
        )}

      </div>
    );
  };

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#090b0f]
        text-white
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        className="
          border-b
          border-white/[0.07]
          bg-[#0b0d11]
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-4
            py-5
            sm:px-6
            lg:px-8
          "
        >

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.02]
                text-zinc-400
                transition
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>

              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-blue-400/70
                "
              >
                SpaceWise
              </p>

              <h1
                className="
                  mt-1
                  text-xl
                  font-semibold
                  tracking-tight
                "
              >
                Smart Cleanup
              </h1>

              <p
                className="
                  mt-1
                  text-xs
                  text-zinc-600
                "
              >
                Find the files using
                the most storage.
              </p>

            </div>

          </div>

          <HardDrive
            className="
              h-5
              w-5
              text-zinc-600
            "
          />

        </div>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main
        className="
          mx-auto
          max-w-7xl
          px-4
          py-7
          sm:px-6
          lg:px-8
        "
      >

        {/* ====================================================
            CLEANUP HERO
        ==================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-white/[0.07]
            bg-[#0d0f13]
            p-5
            sm:p-6
          "
        >

          {/* GLOW */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-24
              h-56
              w-56
              rounded-full
              bg-blue-500/[0.06]
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            {/* TITLE */}

            <div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-blue-400/10
                  bg-blue-400/[0.04]
                  px-3
                  py-1.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-blue-300
                "
              >
                <Sparkles className="h-3 w-3" />

                Smart Cleanup
              </div>

              <h2
                className="
                  mt-4
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                Reclaim your Drive space
              </h2>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-xs
                  leading-5
                  text-zinc-600
                "
              >
                Review your largest files
                and remove files you no longer
                need. Shared files are protected
                automatically.
              </p>

            </div>

            {/* STATS */}

            <div
              className="
                grid
                grid-cols-3
                gap-2
                sm:gap-3
              "
            >

              <div
                className="
                  min-w-[90px]
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.02]
                  p-3
                  sm:min-w-[120px]
                "
              >

                <Files className="h-4 w-4 text-blue-400" />

                <p
                  className="
                    mt-3
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  {files.length}
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    uppercase
                    tracking-wider
                    text-zinc-700
                  "
                >
                  Large files
                </p>

              </div>

              <div
                className="
                  min-w-[90px]
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.02]
                  p-3
                  sm:min-w-[120px]
                "
              >

                <Zap className="h-4 w-4 text-amber-400" />

                <p
                  className="
                    mt-3
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  {ownedFiles.length}
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    uppercase
                    tracking-wider
                    text-zinc-700
                  "
                >
                  Can clean
                </p>

              </div>

              <div
                className="
                  min-w-[90px]
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.02]
                  p-3
                  sm:min-w-[120px]
                "
              >

                <HardDrive className="h-4 w-4 text-emerald-400" />

                <p
                  className="
                    mt-3
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  {formatSize(
                    ownedLargeFileSize
                  )}
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    uppercase
                    tracking-wider
                    text-zinc-700
                  "
                >
                  Review size
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            TOOLBAR
        ==================================================== */}

        <section
          className="
            mt-5
            rounded-[20px]
            border
            border-white/[0.07]
            bg-[#0d0f13]
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-white/[0.07]
              p-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-medium
                  text-zinc-200
                "
              >
                Largest files
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-zinc-600
                "
              >
                Start with the files
                taking up the most space.
              </p>

            </div>

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >

              {/* SELECT ALL */}

              <button
                type="button"
                onClick={
                  toggleSelectAll
                }
                disabled={
                  ownedFiles.length === 0
                }
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  px-3
                  py-2
                  text-[10px]
                  font-medium
                  transition

                  ${
                    allOwnedSelected
                      ? `
                        border-blue-400/20
                        bg-blue-400/[0.08]
                        text-blue-300
                      `
                      : `
                        border-white/[0.08]
                        bg-white/[0.02]
                        text-zinc-400
                        hover:bg-white/[0.05]
                        hover:text-white
                      `
                  }

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                `}
              >

                <CheckCircle className="h-3.5 w-3.5" />

                {allOwnedSelected
                  ? "Clear selection"
                  : "Select all owned"}

              </button>

              {/* TRASH */}

              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  selected.length === 0 ||
                  deleting
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-red-400/10
                  bg-red-400/[0.05]
                  px-3
                  py-2
                  text-[10px]
                  font-semibold
                  text-red-300
                  transition
                  hover:bg-red-400/[0.10]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >

                {deleting ? (
                  <Loader2
                    className="
                      h-3.5
                      w-3.5
                      animate-spin
                    "
                  />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}

                Move to Trash

                {selected.length >
                  0 &&
                  ` (${selected.length})`}

              </button>

            </div>

          </div>

          {/* ==================================================
              MESSAGES
          ================================================== */}

          {error && (
            <div
              className="
                flex
                items-center
                gap-2
                border-b
                border-red-400/10
                bg-red-400/[0.03]
                p-4
                text-xs
                text-red-300
              "
            >
              <AlertCircle className="h-4 w-4 shrink-0" />

              {error}
            </div>
          )}

          {success && (
            <div
              className="
                flex
                items-center
                gap-2
                border-b
                border-emerald-400/10
                bg-emerald-400/[0.03]
                p-4
                text-xs
                text-emerald-300
              "
            >
              <CheckCircle className="h-4 w-4 shrink-0" />

              {success}
            </div>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-3
                p-16
                text-center
              "
            >

              <Loader2
                className="
                  h-6
                  w-6
                  animate-spin
                  text-blue-400
                "
              />

              <div>

                <p className="text-sm text-zinc-400">
                  Analyzing your Drive
                </p>

                <p className="mt-1 text-[10px] text-zinc-700">
                  Finding the largest files...
                </p>

              </div>

            </div>

          ) : files.length === 0 ? (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                p-16
                text-center
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-400/[0.05]
                "
              >
                <CheckCircle
                  className="
                    h-7
                    w-7
                    text-emerald-400
                  "
                />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-medium
                  text-zinc-300
                "
              >
                Your Drive looks clean
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-zinc-700
                "
              >
                No large files were found.
              </p>

            </div>

          ) : (

            <>

              {/* =================================================
                  OWNED FILES
              ================================================= */}

              <div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/[0.06]
                    bg-emerald-400/[0.025]
                    px-4
                    py-3
                  "
                >

                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-emerald-300
                      "
                    >
                      Owned by you
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-zinc-700
                      "
                    >
                      These files can be moved
                      to Trash.
                    </p>

                  </div>

                  <span
                    className="
                      rounded-full
                      bg-emerald-400/[0.07]
                      px-2.5
                      py-1
                      text-[9px]
                      font-medium
                      text-emerald-400
                    "
                  >
                    {ownedFiles.length} files
                  </span>

                </div>

                {ownedFiles.length === 0 ? (

                  <div
                    className="
                      p-8
                      text-center
                      text-xs
                      text-zinc-700
                    "
                  >
                    No owned large files.
                  </div>

                ) : (

                  ownedFiles.map(
                    (file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        owned={true}
                      />
                    )
                  )

                )}

              </div>

              {/* =================================================
                  SHARED FILES
              ================================================= */}

              {sharedFiles.length > 0 && (
                <div
                  className="
                    border-t
                    border-white/[0.08]
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-b
                      border-white/[0.06]
                      bg-yellow-400/[0.02]
                      px-4
                      py-3
                    "
                  >

                    <div>

                      <p
                        className="
                          text-xs
                          font-semibold
                          text-yellow-300
                        "
                      >
                        Shared by someone
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[9px]
                          text-zinc-700
                        "
                      >
                        These files cannot be
                        moved to your Trash.
                      </p>

                    </div>

                    <span
                      className="
                        rounded-full
                        bg-yellow-400/[0.06]
                        px-2.5
                        py-1
                        text-[9px]
                        font-medium
                        text-yellow-400
                      "
                    >
                      {sharedFiles.length} files
                    </span>

                  </div>

                  {sharedFiles.map(
                    (file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        owned={false}
                      />
                    )
                  )}

                </div>
              )}

            </>

          )}

        </section>

        {/* ====================================================
            SAFETY NOTE
        ==================================================== */}

        <div
          className="
            mt-4
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-white/[0.05]
            bg-white/[0.015]
            p-4
          "
        >

          <ShieldCheck
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
              text-emerald-400/70
            "
          />

          <p
            className="
              text-[10px]
              leading-5
              text-zinc-700
            "
          >
            SpaceWise only allows files
            owned by you to be selected for
            cleanup. Shared files remain
            protected.
          </p>

        </div>

      </main>

      {/* ======================================================
          PREVIEW MODAL
      ====================================================== */}

      {previewFile && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/80
            p-3
            backdrop-blur-sm
            sm:p-6
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setPreviewFile(null);
            }
          }}
        >

          <div
            className="
              flex
              h-[90vh]
              w-full
              max-w-6xl
              flex-col
              overflow-hidden
              rounded-[24px]
              border
              border-white/[0.10]
              bg-[#0d0f13]
              shadow-2xl
            "
          >

            {/* PREVIEW HEADER */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                gap-3
                border-b
                border-white/[0.07]
                bg-[#111318]
                px-4
                py-3
              "
            >

              <div className="min-w-0">

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-blue-400/70
                  "
                >
                  File Preview
                </p>

                <h2
                  className="
                    mt-1
                    truncate
                    text-sm
                    font-medium
                    text-zinc-200
                  "
                  title={
                    previewFile.name
                  }
                >
                  {previewFile.name}
                </h2>

              </div>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    openDriveFile(
                      previewFile
                    )
                  }
                  className="
                    hidden
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.025]
                    px-3
                    py-2
                    text-[10px]
                    text-zinc-300
                    transition
                    hover:bg-white/[0.06]
                    hover:text-white
                    sm:inline-flex
                  "
                >
                  <ExternalLink className="h-3 w-3" />

                  Open in Drive
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPreviewFile(null)
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.025]
                    text-zinc-400
                    transition
                    hover:bg-red-400/[0.08]
                    hover:text-red-300
                  "
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

            </div>

            {/* PREVIEW */}

            <div
              className="
                min-h-0
                flex-1
                bg-[#080a0d]
              "
            >

              <iframe
                title={`Preview ${
                  previewFile.name ||
                  "file"
                }`}
                src={getPreviewUrl(
                  previewFile
                )}
                className="
                  h-full
                  w-full
                  border-0
                "
                allow="autoplay; fullscreen"
              />

            </div>

            {/* MOBILE BUTTON */}

            <div
              className="
                shrink-0
                border-t
                border-white/[0.07]
                bg-[#111318]
                p-3
                sm:hidden
              "
            >

              <button
                type="button"
                onClick={() =>
                  openDriveFile(
                    previewFile
                  )
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-blue-400/15
                  bg-blue-400/[0.06]
                  px-4
                  py-3
                  text-xs
                  font-medium
                  text-blue-300
                "
              >
                <ExternalLink className="h-3.5 w-3.5" />

                Open in Google Drive
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {showConfirm && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            flex
            items-center
            justify-center
            bg-black/70
            px-4
            backdrop-blur-sm
          "
        >

          <div
            className="
              w-full
              max-w-md
              rounded-[24px]
              border
              border-white/[0.08]
              bg-[#151517]
              p-6
              shadow-2xl
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-400/[0.07]
                "
              >
                <Trash2
                  className="
                    h-5
                    w-5
                    text-red-400
                  "
                />
              </div>

              <div>

                <h2
                  className="
                    text-base
                    font-semibold
                    text-white
                  "
                >
                  Move files to Trash?
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-zinc-600
                  "
                >
                  {selected.length} file
                  {selected.length === 1
                    ? ""
                    : "s"} selected
                </p>

              </div>

            </div>

            <p
              className="
                mt-5
                text-sm
                leading-6
                text-zinc-400
              "
            >
              The selected files are
              owned by you and will be
              moved to Google Drive Trash.
            </p>

            <div
              className="
                mt-6
                flex
                justify-end
                gap-3
              "
            >

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(false)
                }
                disabled={deleting}
                className="
                  rounded-xl
                  border
                  border-white/[0.08]
                  px-4
                  py-2.5
                  text-xs
                  text-zinc-400
                  transition
                  hover:bg-white/[0.05]
                  hover:text-white
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-red-400/[0.08]
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-red-300
                  transition
                  hover:bg-red-400/[0.14]
                  disabled:opacity-50
                "
              >

                {deleting && (
                  <Loader2
                    className="
                      h-3.5
                      w-3.5
                      animate-spin
                    "
                  />
                )}

                Move to Trash

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default DriveCleanup;