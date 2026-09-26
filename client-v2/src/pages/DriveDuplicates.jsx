import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  Trash2,
} from "lucide-react";


// ============================================================
// DRIVE DUPLICATES
// ============================================================

function DriveDuplicates() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    duplicateGroups,
    setDuplicateGroups,
  ] = useState([]);

  const [
    sharedDuplicateGroups,
    setSharedDuplicateGroups,
  ] = useState([]);

  const [
    mixedDuplicateGroups,
    setMixedDuplicateGroups,
  ] = useState([]);

  const [
    selected,
    setSelected,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);


  // ==========================================================
  // FORMAT FILE SIZE
  // ==========================================================

  const formatSize = (bytes) => {
    const size = Number(bytes || 0);

    if (size === 0) {
      return "0 B";
    }

    const units = [
      "B",
      "KB",
      "MB",
      "GB",
      "TB",
    ];

    const index = Math.floor(
      Math.log(size) / Math.log(1024)
    );

    const safeIndex = Math.min(
      index,
      units.length - 1
    );

    return (
      (
        size /
        Math.pow(1024, safeIndex)
      ).toFixed(
        safeIndex === 0 ? 0 : 2
      ) +
      " " +
      units[safeIndex]
    );
  };


  // ==========================================================
  // OPEN DRIVE FILE
  // ==========================================================

  const openDriveFile = (file) => {
    if (file.webViewLink) {
      window.open(
        file.webViewLink,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    if (file.id) {
      window.open(
        `https://drive.google.com/open?id=${file.id}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };


  // ==========================================================
  // LOAD DUPLICATES
  // ==========================================================

  const loadDuplicates = async () => {
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

      const response = await axios.get(
        "/api/drive/analytics?duplicates=true",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      console.log(
        "===================================="
      );

      console.log(
        "DRIVE ANALYTICS RESPONSE:",
        response.data
      );

      console.log(
        "===================================="
      );

      const analytics =
        response.data?.analytics || {};


      // ======================================================
      // OWNED DUPLICATES
      // ======================================================

      setDuplicateGroups(
        analytics.ownedDuplicates ||
        analytics.duplicateFiles ||
        []
      );


      // ======================================================
      // SHARED DUPLICATES
      // ======================================================

      setSharedDuplicateGroups(
        analytics.sharedDuplicates ||
        []
      );


      // ======================================================
      // MIXED DUPLICATES
      // ======================================================

      setMixedDuplicateGroups(
        analytics.mixedDuplicates ||
        []
      );

    } catch (err) {
      console.error(
        "Duplicate Load Error:",
        err
      );

      console.error(
        "Duplicate Load Response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
        "Unable to load duplicate files."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // LOAD PAGE
  // ==========================================================

  useEffect(() => {
    loadDuplicates();
  }, []);


  // ==========================================================
  // SELECT / UNSELECT
  // ==========================================================

  const toggleFile = (fileId) => {
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
  // DELETE BUTTON
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


      // ====================================================
      // IMPORTANT:
      // Backend route is:
      //
      // DELETE /api/drive/files
      //
      // NOT:
      //
      // POST /api/drive/files
      // /api/drive/delete
      // ====================================================

      const response = await axios.delete(
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


      // ====================================================
      // SUCCESS
      // ====================================================

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


        // Reload duplicate groups
        await loadDuplicates();

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

      console.error(
        "Drive Delete Response:",
        err.response?.data
      );

      console.error(
        "Drive Delete Status:",
        err.response?.status
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
  // SELECTED FILE COUNT
  // ==========================================================

  const selectedCount =
    selected.length;


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-white/10">

        <div className="flex items-center justify-between px-6 py-4">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                navigate("/")
              }
              className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>


            <div>

              <h1 className="text-lg font-semibold">
                Duplicate Files
              </h1>

              <p className="text-xs text-zinc-500">
                Find files with identical content
              </p>

            </div>

          </div>


          <Copy className="h-5 w-5 text-zinc-500" />

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-6xl px-6 py-10">


        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">


          {/* OWNED */}

          <div className="rounded-2xl border border-emerald-400/10 bg-[#111113] p-5">

            <p className="text-xs text-zinc-500">
              My duplicate groups
            </p>

            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {duplicateGroups.length}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Files owned by you
            </p>

          </div>


          {/* SHARED */}

          <div className="rounded-2xl border border-amber-400/10 bg-[#111113] p-5">

            <p className="text-xs text-zinc-500">
              Shared duplicate groups
            </p>

            <p className="mt-2 text-2xl font-semibold text-amber-400">
              {sharedDuplicateGroups.length}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Owned by someone else
            </p>

          </div>


          {/* MIXED */}

          <div className="rounded-2xl border border-blue-400/10 bg-[#111113] p-5">

            <p className="text-xs text-zinc-500">
              Mixed duplicate groups
            </p>

            <p className="mt-2 text-2xl font-semibold text-blue-400">
              {mixedDuplicateGroups.length}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Yours + shared
            </p>

          </div>

        </div>


        {/* ====================================================
            MAIN CARD
        ==================================================== */}

        <div className="rounded-2xl border border-white/10 bg-[#111113]">


          {/* ==================================================
              TOOLBAR
          ================================================== */}

          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-zinc-300">
                Duplicate files
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Different filenames are still detected when the content is identical
              </p>

            </div>


            <button
              onClick={handleDelete}
              disabled={
                selectedCount === 0 ||
                deleting
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >

              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}

              Move to Trash

              {selectedCount > 0 &&
                ` (${selectedCount})`}

            </button>

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="border-b border-red-400/10 bg-red-400/[0.03] p-4 text-sm text-red-400">

              {error}

            </div>

          )}


          {/* ==================================================
              SUCCESS
          ================================================== */}

          {success && (

            <div className="flex items-center gap-2 border-b border-emerald-400/10 bg-emerald-400/[0.03] p-4 text-sm text-emerald-400">

              <CheckCircle className="h-4 w-4" />

              {success}

            </div>

          )}


          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="flex items-center justify-center gap-3 p-16 text-sm text-zinc-500">

              <Loader2 className="h-5 w-5 animate-spin" />

              Analyzing duplicate files...

            </div>

          ) : (

            <>


              {/* =================================================
                  MY DUPLICATES
              ================================================= */}

              <section>

                <div className="flex items-center justify-between border-b border-white/10 p-5">

                  <div>

                    <p className="text-sm font-medium text-zinc-200">
                      My Duplicate Files
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Files owned by you
                    </p>

                  </div>


                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                    Can delete
                  </span>

                </div>


                {duplicateGroups.length === 0 ? (

                  <div className="p-10 text-center">

                    <Copy className="mx-auto h-8 w-8 text-zinc-700" />

                    <p className="mt-3 text-sm text-zinc-500">
                      No duplicate files owned by you.
                    </p>

                  </div>

                ) : (

                  duplicateGroups.map(
                    (group) => (

                      <div
                        key={
                          group.hash ||
                          group.name ||
                          Math.random()
                        }
                        className="border-b border-white/10 p-5"
                      >


                        {/* GROUP HEADER */}

                        <div className="mb-4 flex items-center justify-between">

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium text-zinc-200">
                              {group.name ||
                                "Identical content"}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {group.count ||
                                group.files?.length ||
                                0}{" "}
                              identical copies
                            </p>

                          </div>


                          <Copy className="h-4 w-4 shrink-0 text-zinc-700" />

                        </div>


                        {/* FILES */}

                        <div className="space-y-2">

                          {(group.files || []).map(
                            (file) => (

                              <div
                                key={file.id}
                                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.04]"
                              >


                                {/* CHECKBOX */}

                                <input
                                  type="checkbox"
                                  checked={selected.includes(
                                    file.id
                                  )}
                                  onChange={() =>
                                    toggleFile(
                                      file.id
                                    )
                                  }
                                  className="h-4 w-4 shrink-0 cursor-pointer"
                                />


                                {/* FILE INFO */}

                                <div className="min-w-0 flex-1">

                                  <p className="truncate text-sm text-zinc-300">
                                    {file.name ||
                                      "Unnamed file"}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-emerald-400/70">
                                    Owned by you
                                  </p>

                                  {file.mimeType && (
                                    <p className="mt-1 truncate text-xs text-zinc-600">
                                      {file.mimeType}
                                    </p>
                                  )}

                                </div>


                                {/* SIZE */}

                                <span className="shrink-0 text-xs text-zinc-500">
                                  {formatSize(
                                    file.size
                                  )}
                                </span>


                                {/* OPEN */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    openDriveFile(
                                      file
                                    )
                                  }
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                                >

                                  <ExternalLink className="h-3.5 w-3.5" />

                                  Open

                                </button>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )
                  )

                )}

              </section>


              {/* =================================================
                  SHARED DUPLICATES
              ================================================= */}

              <section>

                <div className="flex items-center justify-between border-b border-white/10 p-5">

                  <div>

                    <p className="text-sm font-medium text-zinc-200">
                      Shared Duplicate Files
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Files owned by someone else
                    </p>

                  </div>


                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                    Cannot delete
                  </span>

                </div>


                {sharedDuplicateGroups.length === 0 ? (

                  <div className="p-10 text-center">

                    <Lock className="mx-auto h-8 w-8 text-zinc-700" />

                    <p className="mt-3 text-sm text-zinc-500">
                      No shared duplicate files found.
                    </p>

                  </div>

                ) : (

                  sharedDuplicateGroups.map(
                    (group) => (

                      <div
                        key={
                          group.hash ||
                          group.name ||
                          Math.random()
                        }
                        className="border-b border-white/10 p-5"
                      >


                        {/* GROUP HEADER */}

                        <div className="mb-4 flex items-center justify-between">

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium text-zinc-200">
                              {group.name ||
                                "Identical content"}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {group.count ||
                                group.files?.length ||
                                0}{" "}
                              identical shared copies
                            </p>

                          </div>


                          <Lock className="h-4 w-4 text-amber-400" />

                        </div>


                        {/* FILES */}

                        <div className="space-y-2">

                          {(group.files || []).map(
                            (file) => (

                              <div
                                key={file.id}
                                className="flex items-center gap-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.02] p-3"
                              >


                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">

                                  <Lock className="h-4 w-4 text-amber-400" />

                                </div>


                                <div className="min-w-0 flex-1">

                                  <p className="truncate text-sm text-zinc-300">
                                    {file.name ||
                                      "Unnamed file"}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-zinc-500">
                                    Owner:{" "}
                                    {file.owner ||
                                      "Unknown owner"}
                                  </p>

                                  <p className="mt-1 text-xs text-amber-400/70">
                                    You cannot delete this file
                                  </p>

                                </div>


                                <span className="shrink-0 text-xs text-zinc-500">
                                  {formatSize(
                                    file.size
                                  )}
                                </span>


                                <button
                                  type="button"
                                  onClick={() =>
                                    openDriveFile(
                                      file
                                    )
                                  }
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                                >

                                  <ExternalLink className="h-3.5 w-3.5" />

                                  Open

                                </button>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )
                  )

                )}

              </section>


              {/* =================================================
                  MIXED DUPLICATES
              ================================================= */}

              <section>

                <div className="flex items-center justify-between border-b border-white/10 p-5">

                  <div>

                    <p className="text-sm font-medium text-zinc-200">
                      Mixed Duplicate Files
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Same content exists in your Drive and shared files
                    </p>

                  </div>


                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                    Review
                  </span>

                </div>


                {mixedDuplicateGroups.length === 0 ? (

                  <div className="p-10 text-center">

                    <Copy className="mx-auto h-8 w-8 text-zinc-700" />

                    <p className="mt-3 text-sm text-zinc-500">
                      No mixed duplicate groups found.
                    </p>

                  </div>

                ) : (

                  mixedDuplicateGroups.map(
                    (group) => (

                      <div
                        key={
                          group.hash ||
                          group.name ||
                          Math.random()
                        }
                        className="border-b border-white/10 p-5"
                      >


                        {/* GROUP HEADER */}

                        <div className="mb-4">

                          <p className="truncate text-sm font-medium text-zinc-200">
                            {group.name ||
                              "Identical content"}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {group.count ||
                              group.files?.length ||
                              0}{" "}
                            identical copies
                          </p>

                        </div>


                        {/* FILES */}

                        <div className="space-y-2">

                          {(group.files || []).map(
                            (file) => (

                              <div
                                key={file.id}
                                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                              >


                                {/* OWNED CHECKBOX / SHARED LOCK */}

                                {file.ownedByMe ? (

                                  <input
                                    type="checkbox"
                                    checked={selected.includes(
                                      file.id
                                    )}
                                    onChange={() =>
                                      toggleFile(
                                        file.id
                                      )
                                    }
                                    className="h-4 w-4 shrink-0 cursor-pointer"
                                  />

                                ) : (

                                  <div className="flex h-4 w-4 shrink-0 items-center justify-center">

                                    <Lock className="h-3.5 w-3.5 text-amber-400" />

                                  </div>

                                )}


                                {/* FILE INFO */}

                                <div className="min-w-0 flex-1">

                                  <p className="truncate text-sm text-zinc-300">
                                    {file.name ||
                                      "Unnamed file"}
                                  </p>


                                  <p className="mt-1 truncate text-xs text-zinc-500">

                                    {file.ownedByMe
                                      ? "Owned by you"
                                      : `Owner: ${
                                          file.owner ||
                                          "Unknown"
                                        }`}

                                  </p>


                                  {!file.ownedByMe && (

                                    <p className="mt-1 text-xs text-amber-400/70">
                                      You cannot delete this file
                                    </p>

                                  )}

                                </div>


                                {/* SIZE */}

                                <span className="shrink-0 text-xs text-zinc-500">
                                  {formatSize(
                                    file.size
                                  )}
                                </span>


                                {/* OPEN */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    openDriveFile(
                                      file
                                    )
                                  }
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                                >

                                  <ExternalLink className="h-3.5 w-3.5" />

                                  Open

                                </button>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )
                  )

                )}

              </section>

            </>

          )}

        </div>

      </main>


      {/* ======================================================
          CONFIRMATION MODAL
      ====================================================== */}

      {showConfirm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151517] p-6 shadow-2xl">


            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">

                <Trash2 className="h-5 w-5 text-red-400" />

              </div>


              <div>

                <h2 className="text-base font-semibold">
                  Move duplicates to Trash?
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {selected.length} file
                  {selected.length === 1
                    ? ""
                    : "s"} selected
                </p>

              </div>

            </div>


            <p className="mt-5 text-sm leading-6 text-zinc-400">
              The selected files are owned by you
              and will be moved to your Google Drive
              Trash.
            </p>


            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowConfirm(false)
                }
                disabled={deleting}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
              >

                {deleting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
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


export default DriveDuplicates;