import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Trash2,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

function DriveTrash() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState([]);

  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Confirmation popup
  const [showClearConfirm, setShowClearConfirm] =
    useState(false);

  // ==========================================
  // LOAD TRASH
  // ==========================================

  const loadTrash = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        return;
      }

      const response = await axios.get(
        "/api/drive/trash",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setFiles(response.data.files || []);
      setSelected([]);
    } catch (err) {
      console.error("Drive Trash Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load Drive Trash."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    loadTrash();
  }, []);

  // ==========================================
  // TOGGLE SINGLE FILE
  // ==========================================

  const toggleFile = (id) => {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id
        );
      }

      return [...current, id];
    });
  };

  // ==========================================
  // SELECT ALL
  // ==========================================

  const selectAll = () => {
    if (files.length === 0) {
      return;
    }

    if (selected.length === files.length) {
      setSelected([]);
    } else {
      setSelected(
        files.map((file) => file.id)
      );
    }
  };

  // ==========================================
  // RESTORE SELECTED FILES
  // ==========================================

  const restoreSelected = async () => {
    if (selected.length === 0) {
      return;
    }

    try {
      setRestoring(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "/api/drive/files/restore",
        {
          fileIds: selected,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      // Remove restored files from UI
      setFiles((current) =>
        current.filter(
          (file) =>
            !selected.includes(file.id)
        )
      );

      setSelected([]);

      setSuccess(
        response.data.message ||
          "Files restored successfully."
      );
    } catch (err) {
      console.error("Restore Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to restore files."
      );
    } finally {
      setRestoring(false);
    }
  };

  // ==========================================
  // SHOW CLEAR BIN CONFIRMATION
  // ==========================================

  const clearBin = () => {
    if (files.length === 0) {
      return;
    }

    setError("");
    setSuccess("");

    // IMPORTANT:
    // Do NOT delete here.
    // Only show confirmation popup.
    setShowClearConfirm(true);
  };

  // ==========================================
  // PERMANENTLY DELETE ENTIRE BIN
  // ==========================================

  const confirmClearBin = async () => {
    try {
      setClearing(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        setShowClearConfirm(false);
        return;
      }

      // IMPORTANT:
      // This must match the backend route:
      //
      // DELETE /api/drive/trash/empty
      //

      const response = await axios.delete(
        "/api/drive/trash/empty",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      // Empty UI immediately
      setFiles([]);
      setSelected([]);

      // Close confirmation popup
      setShowClearConfirm(false);

      setSuccess(
        response.data.message ||
          "Bin cleared successfully."
      );
    } catch (err) {
      console.error(
        "Clear Bin Error:",
        err
      );

      setShowClearConfirm(false);

      setError(
        err.response?.data?.message ||
          "Unable to clear Bin."
      );
    } finally {
      setClearing(false);
    }
  };

  // ==========================================
  // FORMAT FILE SIZE
  // ==========================================

  const formatSize = (bytes) => {
    const size = Number(bytes || 0);

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    if (
      size <
      1024 * 1024 * 1024
    ) {
      return `${(
        size /
        1024 /
        1024
      ).toFixed(1)} MB`;
    }

    return `${(
      size /
      1024 /
      1024 /
      1024
    ).toFixed(2)} GB`;
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="border-b border-white/10">

        <div className="flex items-center justify-between px-6 py-4">

          {/* LEFT SIDE */}

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-lg font-semibold">
                Bin
              </h1>

              <p className="text-xs text-zinc-500">
                Recently deleted Google Drive files
              </p>
            </div>

          </div>

          {/* CLEAR BIN */}

          <button
            type="button"
            onClick={clearBin}
            disabled={
              files.length === 0 ||
              clearing
            }
            className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {clearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            {clearing
              ? "Clearing..."
              : "Clear Bin"}
          </button>

        </div>

      </header>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="mx-auto max-w-5xl px-8 py-10">

        <div className="rounded-2xl border border-white/10 bg-[#111113]">

          {/* ====================================
              TOOLBAR
          ==================================== */}

          <div className="flex items-center justify-between border-b border-white/10 p-5">

            {/* SELECT ALL */}

            <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-400">

              <input
                type="checkbox"
                checked={
                  files.length > 0 &&
                  selected.length ===
                    files.length
                }
                onChange={selectAll}
                className="h-4 w-4"
              />

              Select all

            </label>

            {/* RESTORE */}

            <button
              type="button"
              onClick={restoreSelected}
              disabled={
                selected.length === 0 ||
                restoring
              }
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >

              {restoring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}

              {restoring
                ? "Restoring..."
                : "Restore Selected"}

              {selected.length > 0 &&
                ` (${selected.length})`}

            </button>

          </div>

          {/* ====================================
              ERROR
          ==================================== */}

          {error && (
            <div className="border-b border-red-400/10 bg-red-400/[0.03] p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ====================================
              SUCCESS
          ==================================== */}

          {success && (
            <div className="flex items-center gap-2 border-b border-emerald-400/10 bg-emerald-400/[0.03] p-4 text-sm text-emerald-400">

              <CheckCircle className="h-4 w-4" />

              {success}

            </div>
          )}

          {/* ====================================
              LOADING
          ==================================== */}

          {loading ? (

            <div className="flex items-center justify-center gap-3 p-12 text-sm text-zinc-500">

              <Loader2 className="h-5 w-5 animate-spin" />

              Loading Bin...

            </div>

          ) : files.length === 0 ? (

            /* ==================================
                EMPTY BIN
            ================================== */

            <div className="p-12 text-center">

              <Trash2 className="mx-auto h-10 w-10 text-zinc-600" />

              <p className="mt-4 text-sm text-zinc-400">
                Bin is empty
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Files moved to Google Drive
                Trash will appear here.
              </p>

            </div>

          ) : (

            /* ==================================
                FILE LIST
            ================================== */

            <div>

              {files.map((file) => (

                <label
                  key={file.id}
                  className="flex cursor-pointer items-center gap-4 border-b border-white/5 p-4 transition hover:bg-white/[0.03]"
                >

                  {/* CHECKBOX */}

                  <input
                    type="checkbox"
                    checked={selected.includes(
                      file.id
                    )}
                    onChange={() =>
                      toggleFile(file.id)
                    }
                    className="h-4 w-4"
                  />

                  {/* FILE INFO */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium text-zinc-200">
                      {file.name ||
                        "(Unnamed file)"}
                    </p>

                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {file.mimeType ||
                        "Unknown type"}
                    </p>

                  </div>

                  {/* SIZE */}

                  <span className="text-xs text-zinc-500">
                    {formatSize(
                      file.size
                    )}
                  </span>

                </label>

              ))}

            </div>

          )}

        </div>

      </main>

      {/* ======================================
          CLEAR BIN CONFIRMATION MODAL
      ====================================== */}

      {showClearConfirm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#151517] p-6 shadow-2xl">

            {/* WARNING HEADER */}

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">

                <AlertTriangle className="h-5 w-5 text-red-400" />

              </div>

              <div>

                <h2 className="text-base font-semibold text-white">
                  Clear Bin?
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {files.length} file
                  {files.length === 1
                    ? ""
                    : "s"} will be permanently
                  deleted.
                </p>

              </div>

            </div>

            {/* WARNING MESSAGE */}

            <div className="mt-5 rounded-lg border border-red-500/10 bg-red-500/[0.04] p-4">

              <p className="text-sm leading-6 text-red-300">
                Warning: This action permanently
                deletes all files in your Google
                Drive Bin. These files cannot be
                restored afterward.
              </p>

            </div>

            {/* BUTTONS */}

            <div className="mt-6 flex justify-end gap-3">

              {/* CANCEL */}

              <button
                type="button"
                onClick={() =>
                  setShowClearConfirm(false)
                }
                disabled={clearing}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              {/* PERMANENT DELETE */}

              <button
                type="button"
                onClick={confirmClearBin}
                disabled={clearing}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {clearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                {clearing
                  ? "Deleting..."
                  : "Permanently Delete"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default DriveTrash;