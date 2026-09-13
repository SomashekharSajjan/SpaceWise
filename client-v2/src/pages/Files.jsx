import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Search,
  RefreshCw,
  ExternalLink,
  Trash2,
  FileText,
  Image,
  Video,
  File,
  Folder,
  Loader2,
  X,
  Eye,
} from "lucide-react";

const API_URL = "";

// ============================================================
// FORMAT FILE SIZE
// ============================================================

const formatSize = (bytes) => {
  const size = Number(bytes || 0);

  if (!size) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];

  const index = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  );

  return `${(size / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (date) => {
  if (!date) return "Recently modified";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recently modified";
  }
};

// ============================================================
// GET FILE TYPE
// ============================================================

const getFileType = (file) => {
  const mime = file?.mimeType || "";

  if (mime.includes("folder")) return "folder";

  if (mime.includes("image")) return "image";

  if (mime.includes("video")) return "video";

  if (mime.includes("pdf")) return "pdf";

  if (
    mime.includes("document") ||
    mime.includes("text") ||
    mime.includes("word") ||
    mime.includes("spreadsheet") ||
    mime.includes("presentation")
  ) {
    return "document";
  }

  return "other";
};

// ============================================================
// GET FILE ICON
// ============================================================

const getFileIcon = (file) => {
  const type = getFileType(file);

  if (type === "folder") {
    return <Folder className="h-5 w-5" />;
  }

  if (type === "image") {
    return <Image className="h-5 w-5" />;
  }

  if (type === "video") {
    return <Video className="h-5 w-5" />;
  }

  if (type === "pdf" || type === "document") {
    return <FileText className="h-5 w-5" />;
  }

  return <File className="h-5 w-5" />;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

function Files() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const [sort, setSort] = useState("modified");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [deleteFile, setDeleteFile] = useState(null);

  // Preview file
  const [previewFile, setPreviewFile] = useState(null);

  // ==========================================================
  // LOAD ALL DRIVE FILES
  // ==========================================================

  const loadFiles = async () => {
    try {
      setLoading(true);

      setError("");

      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/drive/files/list?limit=100`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      console.log(
        "DRIVE FILES RESPONSE:",
        response.data
      );

      setFiles(response.data.files || []);
    } catch (err) {
      console.error("Files Page Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");

        localStorage.removeItem("user");

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
    loadFiles();
  }, []);

  // ==========================================================
  // FILTER + SEARCH + SORT
  // ==========================================================

  const filteredFiles = useMemo(() => {
    let result = [...files];

    // SEARCH
    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((file) =>
        String(file.name || "")
          .toLowerCase()
          .includes(query)
      );
    }

    // FILTER
    if (filter !== "all") {
      result = result.filter(
        (file) => getFileType(file) === filter
      );
    }

    // SORT BY NAME
    if (sort === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    // SORT BY SIZE
    if (sort === "size") {
      result.sort(
        (a, b) =>
          Number(b.size || 0) -
          Number(a.size || 0)
      );
    }

    // SORT BY MODIFIED
    if (sort === "modified") {
      result.sort(
        (a, b) =>
          new Date(b.modifiedTime || 0) -
          new Date(a.modifiedTime || 0)
      );
    }

    return result;
  }, [files, search, filter, sort]);

  // ==========================================================
  // OPEN IN GOOGLE DRIVE
  // ==========================================================

  const openFile = (file) => {
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
  // PREVIEW FILE
  // ==========================================================

  const previewFileInSpaceWise = (file) => {
    if (!file?.id) {
      setError("Unable to preview this file.");

      return;
    }

    // Folders cannot be embedded as previews.
    if (getFileType(file) === "folder") {
      openFile(file);

      return;
    }

    setPreviewFile(file);
  };

  // ==========================================================
  // GET GOOGLE DRIVE PREVIEW URL
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
  // CONFIRM DELETE
  // ==========================================================

  const confirmDelete = async () => {
    if (!deleteFile?.id) {
      return;
    }

    try {
      setDeleting(true);

      setError("");

      setSuccess("");

      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/api/drive/files`,
        {
          headers: {
            Authorization: token,
          },

          data: {
            fileIds: [deleteFile.id],
          },
        }
      );

      // Remove from UI
      setFiles((current) =>
        current.filter(
          (file) => file.id !== deleteFile.id
        )
      );

      // Close preview if the same file is open
      if (
        previewFile?.id === deleteFile.id
      ) {
        setPreviewFile(null);
      }

      setSuccess(
        `"${deleteFile.name}" moved to Drive Trash.`
      );

      setDeleteFile(null);
    } catch (err) {
      console.error(
        "Delete File Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to move file to Trash."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // KEYBOARD ESCAPE FOR PREVIEW
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewFile(null);
        setDeleteFile(null);
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
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#090b0f] text-white">

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            {/* BACK */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                text-zinc-400
                transition
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* TITLE */}

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400/70">
                Google Drive
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                My Files
              </h1>

              <p className="mt-1 text-xs text-zinc-600">
                Search and manage your Drive files.
              </p>

            </div>

          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={loadFiles}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-4
              py-2.5
              text-xs
              font-medium
              text-zinc-300
              transition
              hover:bg-white/[0.06]
              disabled:opacity-50
            "
          >

            <RefreshCw
              className={`h-3.5 w-3.5 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh

          </button>

        </div>

        {/* ==================================================
            SEARCH + SORT + FILTER
        ================================================== */}

        <div
          className="
            mt-7
            rounded-[22px]
            border
            border-white/[0.07]
            bg-[#0d0f13]
            p-4
          "
        >

          {/* SEARCH + SORT */}

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">

              <Search
                className="
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-zinc-700
                "
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search files..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  py-3
                  pl-10
                  pr-10
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-zinc-700
                  focus:border-blue-400/30
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-zinc-600
                    hover:text-white
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              )}

            </div>

            {/* SORT */}

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value
                )
              }
              className="
                rounded-xl
                border
                border-white/[0.07]
                bg-[#111318]
                px-4
                py-3
                text-xs
                text-zinc-300
                outline-none
              "
            >

              <option value="modified">
                Recently modified
              </option>

              <option value="name">
                Name
              </option>

              <option value="size">
                Largest first
              </option>

            </select>

          </div>

          {/* ==================================================
              FILTER BUTTONS
          ================================================== */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

            {[
              ["all", "All"],
              ["document", "Documents"],
              ["pdf", "PDFs"],
              ["image", "Images"],
              ["video", "Videos"],
              ["folder", "Folders"],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(value)
                  }
                  className={`
                    shrink-0
                    rounded-xl
                    border
                    px-4
                    py-2
                    text-[10px]
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      filter === value
                        ? `
                          border-blue-400/30
                          bg-blue-400/10
                          text-blue-300
                          shadow-[0_0_12px_rgba(59,130,246,0.10)]
                        `
                        : `
                          border-white/[0.08]
                          bg-white/[0.015]
                          text-zinc-400
                          hover:border-blue-400/20
                          hover:bg-blue-400/[0.05]
                          hover:text-blue-300
                        `
                    }
                  `}
                >
                  {label}
                </button>
              )
            )}

          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            className="
              mt-4
              rounded-xl
              border
              border-red-400/10
              bg-red-400/[0.04]
              px-4
              py-3
              text-xs
              text-red-300
            "
          >
            {error}
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div
            className="
              mt-4
              rounded-xl
              border
              border-emerald-400/10
              bg-emerald-400/[0.04]
              px-4
              py-3
              text-xs
              text-emerald-300
            "
          >
            {success}
          </div>
        )}

        {/* ==================================================
            COUNT
        ================================================== */}

        <div className="mt-6 flex items-center justify-between">

          <p className="text-xs text-zinc-600">

            {loading
              ? "Loading files..."
              : `${filteredFiles.length} file${
                  filteredFiles.length === 1
                    ? ""
                    : "s"
                } shown`}

          </p>

          {search && (
            <p className="text-[10px] text-zinc-700">
              Searching for "{search}"
            </p>
          )}

        </div>

        {/* ==================================================
            FILE LIST
        ================================================== */}

        {loading ? (

          <div
            className="
              mt-4
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >

            {[
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
            ].map((item) => (
              <div
                key={item}
                className="
                  h-48
                  animate-pulse
                  rounded-[20px]
                  border
                  border-white/[0.06]
                  bg-white/[0.02]
                "
              />
            ))}

          </div>

        ) : filteredFiles.length === 0 ? (

          <div
            className="
              mt-4
              flex
              flex-col
              items-center
              justify-center
              rounded-[24px]
              border
              border-white/[0.07]
              bg-[#0d0f13]
              py-20
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
                bg-white/[0.04]
              "
            >
              <File className="h-6 w-6 text-zinc-700" />
            </div>

            <h2 className="mt-4 text-sm font-medium text-zinc-400">
              No files found
            </h2>

            <p className="mt-1 max-w-sm text-xs text-zinc-700">
              Try a different search term or file type.
            </p>

          </div>

        ) : (

          <div
            className="
              mt-4
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >

            {filteredFiles.map(
              (file) => (

                <div
                  key={file.id}
                  className="
                    group
                    rounded-[20px]
                    border
                    border-white/[0.07]
                    bg-[#0d0f13]
                    p-4
                    transition
                    hover:-translate-y-0.5
                    hover:border-blue-400/[0.15]
                  "
                >

                  {/* FILE ICON + OWNED */}

                  <div className="flex items-start justify-between gap-3">

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-400/[0.07]
                        text-blue-300
                      "
                    >
                      {getFileIcon(file)}
                    </div>

                    {file.ownedByMe && (
                      <span
                        className="
                          rounded-lg
                          bg-emerald-400/[0.06]
                          px-2
                          py-1
                          text-[9px]
                          text-emerald-400
                        "
                      >
                        Owned
                      </span>
                    )}

                  </div>

                  {/* FILE NAME */}

                  <p
                    className="
                      mt-4
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

                  {/* MIME TYPE */}

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

                  {/* DATE + SIZE */}

                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      justify-between
                      gap-2
                      text-[10px]
                      text-zinc-700
                    "
                  >

                    <span>
                      {formatDate(
                        file.modifiedTime
                      )}
                    </span>

                    <span>
                      {formatSize(
                        file.size
                      )}
                    </span>

                  </div>

                  {/* ==================================================
                      ACTION BUTTONS
                  ================================================== */}

                  <div className="mt-4 flex gap-2">

                    {/* PREVIEW */}

                    {getFileType(file) !==
                      "folder" && (
                      <button
                        type="button"
                        onClick={() =>
                          previewFileInSpaceWise(
                            file
                          )
                        }
                        className="
                          flex-1
                          rounded-xl
                          border
                          border-blue-400/10
                          bg-blue-400/[0.04]
                          px-3
                          py-2
                          text-[10px]
                          font-medium
                          text-blue-300
                          transition
                          hover:border-blue-400/25
                          hover:bg-blue-400/[0.09]
                        "
                      >
                        <Eye className="mr-1 inline h-3 w-3" />

                        Preview
                      </button>
                    )}

                    {/* OPEN */}

                    <button
                      type="button"
                      onClick={() =>
                        openFile(file)
                      }
                      className="
                        flex-1
                        rounded-xl
                        border
                        border-white/[0.07]
                        bg-white/[0.025]
                        px-3
                        py-2
                        text-[10px]
                        font-medium
                        text-zinc-300
                        transition
                        hover:border-blue-400/20
                        hover:bg-blue-400/[0.06]
                        hover:text-blue-300
                      "
                    >
                      <ExternalLink className="mr-1 inline h-3 w-3" />

                      Open
                    </button>

                    {/* DELETE */}

                    {file.ownedByMe &&
                      file.canTrash !== false && (
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteFile(
                              file
                            )
                          }
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-red-400/10
                            bg-red-400/[0.04]
                            text-red-400
                            transition
                            hover:bg-red-400/[0.09]
                          "
                          title="Move to Trash"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}

                  </div>

                </div>
              )
            )}

          </div>
        )}

        {/* ==================================================
            PREVIEW MODAL
        ================================================== */}

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
                  sm:px-5
                "
              >

                {/* FILE INFO */}

                <div className="min-w-0">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-400/70">
                    Preview
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

                {/* ACTIONS */}

                <div className="flex shrink-0 items-center gap-2">

                  {/* OPEN DRIVE */}

                  <button
                    type="button"
                    onClick={() =>
                      openFile(
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
                      font-medium
                      text-zinc-300
                      transition
                      hover:bg-white/[0.06]
                      hover:text-blue-300
                      sm:inline-flex
                    "
                  >
                    <ExternalLink className="h-3 w-3" />

                    Open in Drive
                  </button>

                  {/* CLOSE */}

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
                    title="Close preview"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

              </div>

              {/* PREVIEW CONTENT */}

              <div
                className="
                  min-h-0
                  flex-1
                  bg-[#080a0d]
                "
              >

                <iframe
                  title={`Preview of ${
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

              {/* MOBILE OPEN BUTTON */}

              <div
                className="
                  flex
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
                    openFile(
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

        {/* ==================================================
            DELETE CONFIRMATION
        ================================================== */}

        {deleteFile && (
          <div
            className="
              fixed
              inset-0
              z-[60]
              flex
              items-center
              justify-center
              bg-black/70
              p-4
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
                bg-[#111318]
                p-6
                shadow-2xl
              "
            >

              <h2 className="text-lg font-semibold text-white">
                Move to Trash?
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-zinc-500
                "
              >

                Are you sure you want to move

                <span className="font-medium text-zinc-200">
                  {" "}
                  "{deleteFile.name}"
                </span>{" "}

                to Google Drive Trash?

              </p>

              <div className="mt-6 flex gap-3">

                {/* CANCEL */}

                <button
                  type="button"
                  onClick={() =>
                    setDeleteFile(
                      null
                    )
                  }
                  disabled={deleting}
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-white/[0.07]
                    px-4
                    py-3
                    text-xs
                    text-zinc-400
                    transition
                    hover:bg-white/[0.04]
                    hover:text-white
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={
                    confirmDelete
                  }
                  disabled={deleting}
                  className="
                    flex-1
                    rounded-xl
                    bg-red-500/10
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    text-red-300
                    transition
                    hover:bg-red-500/15
                    disabled:opacity-50
                  "
                >

                  {deleting ? (
                    <>
                      <Loader2
                        className="
                          mr-2
                          inline
                          h-3.5
                          w-3.5
                          animate-spin
                        "
                      />

                      Moving...
                    </>
                  ) : (
                    "Move to Trash"
                  )}

                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Files;