import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "";

function GmailCleanup() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // GET TYPE FROM URL
  // Example:
  // /gmail-cleanup?type=trash
  // /gmail-cleanup?type=promotions
  // ==========================================

  const params = new URLSearchParams(
    location.search
  );

  const type =
    params.get("type") || "all";

  // ==========================================
  // STATE
  // ==========================================

  const [messages, setMessages] =
    useState([]);

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

  const [currentPage, setCurrentPage] =
    useState(1);

  // ==========================================
  // EMAILS PER PAGE
  // ==========================================

  const EMAILS_PER_PAGE = 10;

  // ==========================================
  // PAGE TITLE
  // ==========================================

  const pageTitle = useMemo(() => {
    switch (type) {
      case "trash":
        return "Trash Emails";

      case "promotions":
        return "Promotional Emails";

      case "social":
        return "Social Emails";

      case "updates":
        return "Update Emails";

      case "spam":
        return "Spam Emails";

      default:
        return "Gmail Cleanup";
    }
  }, [type]);

  // ==========================================
  // PAGE DESCRIPTION
  // ==========================================

  const pageDescription =
    type === "trash"
      ? "Select emails you want to permanently delete"
      : "Review emails you want to clean up";

  // ==========================================
  // LOAD GMAIL MESSAGES
  // ==========================================

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // ========================================
      // ALWAYS GET CURRENT TOKEN
      // ========================================

      const token =
        localStorage.getItem("token");

      // ========================================
      // NO TOKEN
      // ========================================

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      console.log(
        "===================================="
      );

      console.log(
        "LOADING GMAIL PAGE"
      );

      console.log(
        "GMAIL TYPE:",
        type
      );

      console.log(
        "CURRENT JWT EXISTS:",
        !!token
      );

      // ========================================
      // IMPORTANT:
      // DO NOT LOAD EMAILS FROM localStorage.
      //
      // ALWAYS FETCH FROM BACKEND.
      // ========================================

      const response =
        await axios.get(
          `${API_URL}/api/gmail/messages`,
          {
            params: {
              type,
              limit:100,
            },

            headers: {
              Authorization: token,
            },
          }
        );

      console.log(
        "GMAIL RESPONSE:",
        response.data
      );

      // ========================================
      // SET FRESH EMAIL DATA
      // ========================================

      const freshMessages =
        response.data?.messages || [];

      setMessages(
        freshMessages
      );

      // ========================================
      // CLEAR OLD SELECTION
      // ========================================

      setSelected([]);

      // ========================================
      // ALWAYS START FROM PAGE 1
      // ========================================

      setCurrentPage(1);

      console.log(
        "FRESH GMAIL MESSAGES:",
        freshMessages.length
      );

      console.log(
        "===================================="
      );
    } catch (err) {
      console.error(
        "Gmail Load Error:",
        err
      );

      // ========================================
      // TOKEN EXPIRED / INVALID
      // ========================================

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setMessages([]);

        setSelected([]);

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load Gmail messages."
      );

      setMessages([]);

      setSelected([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD WHEN PAGE OR TYPE CHANGES
  // ==========================================

  useEffect(() => {
    loadMessages();
  }, [type]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages =
    Math.ceil(
      messages.length /
        EMAILS_PER_PAGE
    ) || 1;

  const startIndex =
    (currentPage - 1) *
    EMAILS_PER_PAGE;

  const endIndex =
    startIndex +
    EMAILS_PER_PAGE;

  const currentMessages =
    messages.slice(
      startIndex,
      endIndex
    );

  // ==========================================
  // SELECT / UNSELECT EMAIL
  // ==========================================

  const toggleEmail = (id) => {
    setSelected((previous) => {
      if (
        previous.includes(id)
      ) {
        return previous.filter(
          (item) => item !== id
        );
      }

      return [
        ...previous,
        id,
      ];
    });
  };

  // ==========================================
  // SELECT ALL ON CURRENT PAGE
  // ==========================================

  const toggleSelectAll = () => {
    const currentPageIds =
      currentMessages.map(
        (message) => message.id
      );

    const allSelected =
      currentPageIds.length > 0 &&
      currentPageIds.every(
        (id) =>
          selected.includes(id)
      );

    if (allSelected) {
      setSelected(
        (previous) =>
          previous.filter(
            (id) =>
              !currentPageIds.includes(
                id
              )
          )
      );
    } else {
      setSelected(
        (previous) => [
          ...new Set([
            ...previous,
            ...currentPageIds,
          ]),
        ]
      );
    }
  };

  // ==========================================
  // CHECK CURRENT PAGE SELECTION
  // ==========================================

  const allCurrentPageSelected =
    currentMessages.length > 0 &&
    currentMessages.every(
      (message) =>
        selected.includes(
          message.id
        )
    );

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  // ==========================================
  // PERMANENT DELETE
  // ==========================================

  const handlePermanentDelete =
    async () => {
      if (
        selected.length === 0 ||
        deleting
      ) {
        return;
      }

      try {
        setDeleting(true);
        setError("");
        setSuccess("");

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        console.log(
          "===================================="
        );

        console.log(
          "PERMANENT DELETE:"
        );

        console.log(
          selected
        );

        // ======================================
        // SEND ONLY CURRENTLY SELECTED IDs
        // ======================================

        const response =
          await axios.delete(
            `${API_URL}/api/gmail/permanent-delete`,
            {
              headers: {
                Authorization: token,
              },

              data: {
                messageIds:
                  selected,
              },
            }
          );

        console.log(
          "PERMANENT DELETE RESPONSE:",
          response.data
        );

        const deletedCount =
          response.data
            ?.deletedCount || 0;

        // ======================================
        // REMOVE SUCCESSFULLY DELETED EMAILS
        // FROM CURRENT UI
        // ======================================

        if (
          deletedCount > 0
        ) {
          const failedIds =
            (
              response.data
                ?.failed || []
            ).map(
              (item) => item.id
            );

          setMessages(
            (previous) =>
              previous.filter(
                (message) =>
                  !selected.includes(
                    message.id
                  ) ||
                  failedIds.includes(
                    message.id
                  )
              )
          );

          setSelected([]);

          setSuccess(
            `${deletedCount} email${
              deletedCount === 1
                ? ""
                : "s"
            } permanently deleted.`
          );
        } else {
          // ====================================
          // NOTHING DELETED
          // ====================================

          setError(
            response.data
              ?.message ||
              "No emails were permanently deleted."
          );
        }

        console.log(
          "===================================="
        );
      } catch (err) {
        console.error(
          "Permanent Delete Error:",
          err
        );

        // ======================================
        // TOKEN INVALID
        // ======================================

        if (
          err.response?.status ===
          401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        // ======================================
        // SHOW BACKEND ERROR
        // ======================================

        setError(
          err.response?.data
            ?.message ||
            "Unable to permanently delete emails."
        );
      } finally {
        setDeleting(false);
      }
    };

  // ==========================================
  // MOVE NORMAL EMAILS TO TRASH
  // ==========================================

  const handleMoveToTrash =
    async () => {
      if (
        selected.length === 0 ||
        deleting
      ) {
        return;
      }

      try {
        setDeleting(true);
        setError("");
        setSuccess("");

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const response =
          await axios.post(
            `${API_URL}/api/gmail/trash`,
            {
              messageIds:
                selected,
            },
            {
              headers: {
                Authorization: token,
              },
            }
          );

        console.log(
          "MOVE TO TRASH RESPONSE:",
          response.data
        );

        const movedCount =
          response.data
            ?.movedCount || 0;

        if (
          movedCount > 0
        ) {
          const failedIds =
            (
              response.data
                ?.failed || []
            ).map(
              (item) => item.id
            );

          setMessages(
            (previous) =>
              previous.filter(
                (message) =>
                  !selected.includes(
                    message.id
                  ) ||
                  failedIds.includes(
                    message.id
                  )
              )
          );

          setSelected([]);

          setSuccess(
            `${movedCount} email${
              movedCount === 1
                ? ""
                : "s"
            } moved to Trash.`
          );
        } else {
          setError(
            response.data
              ?.message ||
              "No emails were moved to Trash."
          );
        }
      } catch (err) {
        console.error(
          "Move To Trash Error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to move emails to Trash."
        );
      } finally {
        setDeleting(false);
      }
    };

  // ==========================================
  // PAGE CHANGE
  // ==========================================

  const goToPage = (
    page
  ) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // GENERATE PAGE NUMBERS
  // ==========================================

  const pageNumbers =
    Array.from(
      {
        length: totalPages,
      },
      (_, index) =>
        index + 1
    );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">

      {/* ========================================
          HEADER
      ======================================== */}

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
                {pageTitle}
              </h1>

              <p className="text-xs text-zinc-500">
                {pageDescription}
              </p>

            </div>

          </div>

          <Mail className="h-5 w-5 text-zinc-500" />

        </div>

      </header>

      {/* ========================================
          MAIN
      ======================================== */}

      <main className="mx-auto max-w-6xl px-6 py-8">

        <div className="rounded-2xl border border-white/10 bg-[#111113]">

          {/* ======================================
              TOOLBAR
          ====================================== */}

          <div className="flex items-center justify-between border-b border-white/10 p-5">

            <label className="flex cursor-pointer items-center gap-3">

              <input
                type="checkbox"
                checked={
                  allCurrentPageSelected
                }
                onChange={
                  toggleSelectAll
                }
                className="h-5 w-5"
              />

              <span className="text-sm text-zinc-300">
                Select all on this page
              </span>

            </label>

            <div className="flex items-center gap-3">

              {type ===
              "trash" ? (
                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      `Are you sure you want to permanently delete ${
                        selected.length
                      } email${
                        selected.length === 1 ? "" : "s"
                      }?\\n\\nThis action cannot be undone.`
                    );

                    if (confirmed) {
                      handlePermanentDelete();
                    }
                  }}
                  disabled={
                    selected.length ===
                      0 ||
                    deleting
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  Permanently Delete

                  {selected.length >
                    0 &&
                    ` (${selected.length})`}

                </button>
              ) : (
                <button
                  onClick={
                    handleMoveToTrash
                  }
                  disabled={
                    selected.length ===
                      0 ||
                    deleting
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  Move to Trash

                  {selected.length >
                    0 &&
                    ` (${selected.length})`}

                </button>
              )}

            </div>

          </div>

          {/* ======================================
              SUCCESS
          ====================================== */}

          {success && (
            <div className="flex items-center gap-2 border-b border-emerald-400/10 bg-emerald-400/[0.03] p-4 text-sm text-emerald-400">

              <CheckCircle className="h-4 w-4" />

              {success}

            </div>
          )}

          {/* ======================================
              ERROR
          ====================================== */}

          {error && (
            <div className="border-b border-red-400/10 bg-red-400/[0.03] p-4 text-sm text-red-400">

              {error}

            </div>
          )}

          {/* ======================================
              LOADING
          ====================================== */}

          {loading ? (

            <div className="flex items-center justify-center gap-3 p-16 text-sm text-zinc-500">

              <Loader2 className="h-5 w-5 animate-spin" />

              Loading Gmail emails...

            </div>

          ) : messages.length ===
            0 ? (

            /* ====================================
               EMPTY
            ==================================== */

            <div className="p-16 text-center">

              <Mail className="mx-auto h-10 w-10 text-zinc-600" />

              <p className="mt-4 text-sm text-zinc-400">
                {type === "trash"
                  ? "Gmail Trash is empty."
                  : "No emails found."}
              </p>

            </div>

          ) : (

            /* ====================================
               EMAIL LIST
            ==================================== */

            <div>

              {currentMessages.map(
                (message) => (

                  <div
                    key={
                      message.id
                    }
                    className="flex items-center gap-4 border-b border-white/10 px-5 py-5 transition hover:bg-white/[0.025]"
                  >

                    {/* CHECKBOX */}

                    <input
                      type="checkbox"
                      checked={selected.includes(
                        message.id
                      )}
                      onChange={() =>
                        toggleEmail(
                          message.id
                        )
                      }
                      className="h-5 w-5 shrink-0"
                    />

                    {/* EMAIL CONTENT */}

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-medium text-zinc-200">

                        {message.subject ||
                          "(No subject)"}

                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">

                        {message.from ||
                          "Unknown sender"}

                      </p>

                    </div>

                    {/* DATE */}

                    <div className="hidden shrink-0 text-right text-xs text-zinc-600 md:block">

                      {formatDate(
                        message.date
                      )}

                    </div>

                  </div>

                )
              )}

            </div>
          )}

          {/* ======================================
              PAGINATION
          ====================================== */}

          {!loading &&
            messages.length > 0 && (

              <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 p-5 sm:flex-row">

                {/* INFO */}

                <p className="text-xs text-zinc-500">

                  Showing{" "}
                  <span className="text-zinc-300">
                    {startIndex + 1}
                  </span>

                  {" - "}

                  <span className="text-zinc-300">
                    {Math.min(
                      endIndex,
                      messages.length
                    )}
                  </span>

                  {" of "}

                  <span className="text-zinc-300">
                    {messages.length}
                  </span>

                  {" emails"}

                </p>

                {/* PAGINATION */}

                <div className="flex items-center gap-2">

                  {/* PREVIOUS */}

                  <button
                    onClick={() =>
                      goToPage(
                        currentPage -
                          1
                      )
                    }
                    disabled={
                      currentPage ===
                      1
                    }
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* PAGE NUMBERS */}

                  <div className="flex items-center gap-1">

                    {pageNumbers.map(
                      (page) => (

                        <button
                          key={page}
                          onClick={() =>
                            goToPage(
                              page
                            )
                          }
                          className={`min-w-9 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                            currentPage ===
                            page
                              ? "border-blue-400/40 bg-blue-500/20 text-blue-300"
                              : "border-white/10 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          {page}
                        </button>

                      )
                    )}

                  </div>

                  {/* NEXT */}

                  <button
                    onClick={() =>
                      goToPage(
                        currentPage +
                          1
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                </div>

              </div>

            )}

        </div>

      </main>

    </div>
  );
}

export default GmailCleanup;