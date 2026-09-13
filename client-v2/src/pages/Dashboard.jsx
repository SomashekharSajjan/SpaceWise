import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  HardDrive,
  Mail,
  Database,
  Sparkles,
  ArrowRight,
  Loader2,
  Trash2,
  Settings,
  LogOut,
  LayoutGrid,
  FileStack,
  X,
  ExternalLink,
  ShieldCheck,
  Clock3,
  Files,
} from "lucide-react";

import GmailAnalytics from "../components/gmail/GmailAnalytics";

import { getGmailProfile } from "../services/gmailApi";
import { getDriveAnalytics } from "../services/driveApi";
import { getStorageHealth } from "../services/aiApi";
import { getGmailCategories } from "../services/gmailCategoryApi";

// =========================================================
// HELPERS
// =========================================================

const formatStorage = (bytes) => {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value < 0) {
    return "—";
  }

  const gb = value / (1024 * 1024 * 1024);

  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`;
  }

  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const getBarWidth = (value, max) => {
  const n = Number(value) || 0;
  const m = Number(max) || 1;

  return `${Math.min((n / m) * 100, 100)}%`;
};

const formatDate = (date) => {
  if (!date) {
    return "Recently modified";
  }

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

const getFileIcon = (mimeType = "") => {
  if (mimeType.includes("image")) return "IMG";
  if (mimeType.includes("video")) return "VID";
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("folder")) return "DIR";
  return "FILE";
};

// =========================================================
// RING
// =========================================================

function Ring({
  value,
  size = 56,
  stroke = 5,
  color = "#38bdf8",
  children,
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(
          ${color} ${pct * 3.6}deg,
          rgba(255,255,255,0.08) 0deg
        )`,
      }}
    >
      <div
        className="absolute rounded-full bg-[#0b0d11]"
        style={{ inset: stroke }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}


function StorageInsightBar({
  label,
  value,
  max,
  color,
}) {
  const percentage =
    max > 0
      ? Math.min((Number(value || 0) / max) * 100, 100)
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
          <span className="text-xs text-zinc-500">
            {label}
          </span>
        </div>

        <span className="text-xs font-medium text-zinc-300">
          {Number(value || 0).toLocaleString()}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${percentage}%`,
            background: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

// =========================================================
// SCROLL
// =========================================================


// =========================================================
// PREMIUM ACTION BOX
// =========================================================
function PremiumAction({ label, color = "#38bdf8" }) {
  return (
    <div
      className="spacewise-action relative mt-4 inline-flex items-center gap-2 overflow-hidden rounded-xl border px-3 py-2"
      style={{
        borderColor: `${color}22`,
        background: `${color}08`,
        boxShadow: `inset 0 0 0 1px ${color}06`,
      }}
    >
      <span
        className="spacewise-action-glow pointer-events-none absolute inset-[-120%]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 55deg, ${color}80 90deg, transparent 125deg, transparent 360deg)`,
        }}
      />
      <span
        className="spacewise-action-shine pointer-events-none absolute inset-y-0 -left-[120%] w-1/2 skew-x-[-20deg]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}18, transparent)`,
        }}
      />
      <span
        className="spacewise-action-inner absolute inset-[1px] rounded-[10px]"
        style={{ background: "#111216" }}
      />
      <span className="relative z-10 text-xs font-semibold" style={{ color }}>
        {label}
      </span>
      <ArrowRight
        className="spacewise-action-arrow relative z-10 h-3.5 w-3.5"
        style={{ color }}
      />
    </div>
  );
}

const scrollToId = (id) => {
  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
};

// =========================================================
// DASHBOARD
// =========================================================

function Dashboard() {
  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [gmail, setGmail] = useState(null);
  const [drive, setDrive] = useState(null);

  // Lightweight recent files for the My Files widget.
  // This is intentionally separate from the heavy Drive analytics request.
  const [recentDriveFiles, setRecentDriveFiles] = useState([]);

  const [health, setHealth] = useState(null);
  const [labels, setLabels] = useState([]);

  // Google AI Pro detection:
  // A 5 TB Drive quota is used as the signal for the AI Pro
  // storage benefit in this dashboard. Normal 15 GB accounts
  // will not see the AI Pro message.

  const [recentlyDeletedCount, setRecentlyDeletedCount] =
    useState(0);

  const [showRecentFiles, setShowRecentFiles] =
    useState(false);

  const [recentFileTab, setRecentFileTab] =
    useState("owned");

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [fileToDelete, setFileToDelete] =
    useState(null);

  const [deletingFile, setDeletingFile] =
    useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  const [gmailLoading, setGmailLoading] =
    useState(true);

  const [driveLoading, setDriveLoading] =
    useState(true);

  const [healthLoading, setHealthLoading] =
    useState(true);

  // =======================================================
  // DYNAMIC GREETING
  // =======================================================

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  };
  const getDisplayName = () => {
    const profileName =
      gmail?.name ||
      gmail?.displayName ||
      gmail?.givenName ||
      gmail?.user?.name ||
      "";

    if (
      typeof profileName === "string" &&
      profileName.trim()
    ) {
      return profileName.trim().split(/\s+/)[0];
    }

    return "there";
  };

  const getAvatarLetter = () => {
    const name = getDisplayName();

    return name.charAt(0).toUpperCase() || "U";
  };

  // =======================================================
  // STORAGE
  // =======================================================

  const storageUsedBytes =
    Number(drive?.storageQuota?.usage ?? 0);

  const storageLimitBytes =
    Number(drive?.storageQuota?.limit ?? 0);

  const storagePercent =
    storageLimitBytes > 0
      ? Math.min(
          (storageUsedBytes / storageLimitBytes) * 100,
          100
        )
      : 0;

  // Google AI Pro accounts in this project have a 5 TB quota.
  // Do not show the AI Pro message for normal 15 GB accounts.
  const FIVE_TB_BYTES =
    5 * 1024 * 1024 * 1024 * 1024;

  const hasAiPro =
    storageLimitBytes >= FIVE_TB_BYTES;

  // =======================================================
  // LOAD DATA
  // =======================================================

  useEffect(() => {
    const loadGmail = async () => {
      try {
        const response = await getGmailProfile();

        setGmail(response.profile);
      } catch (error) {
        console.error("Gmail Error:", error);
      } finally {
        setGmailLoading(false);
      }
    };

    const loadDrive = async () => {
      try {
        const response = await getDriveAnalytics();

        setDrive(response.analytics);
      } catch (error) {
        console.error("Drive Error:", error);
      } finally {
        setDriveLoading(false);
      }
    };

    // ==========================================
    // LIGHTWEIGHT RECENT DRIVE FILES
    // ==========================================
    const loadRecentDriveFiles = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await axios.get(
          "/api/drive/recent?limit=10",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setRecentDriveFiles(
          response.data.files || []
        );
      } catch (error) {
        console.error(
          "Recent Drive Files Error:",
          error
        );

        setRecentDriveFiles([]);
      }
    };

    const loadHealth = async () => {
      try {
        const response = await getStorageHealth();

        setHealth(response.health);
      } catch (error) {
        console.error("AI Health Error:", error);
      } finally {
        setHealthLoading(false);
      }
    };

    const loadGmailCategories = async () => {
      try {
        const response =
          await getGmailCategories();

        setLabels(response);
      } catch (error) {
        console.error(
          "Gmail Categories Error:",
          error
        );
      }
    };

    const loadTrashCount = async () => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await axios.get(
          "/api/drive/trash",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setRecentlyDeletedCount(
          response.data.files?.length || 0
        );
      } catch (error) {
        console.error(
          "Drive Trash Count Error:",
          error
        );

        setRecentlyDeletedCount(0);
      }
    };

    loadGmail();
    loadDrive();
    loadRecentDriveFiles();
    loadHealth();
    loadGmailCategories();
    loadTrashCount();
  }, []);

  // =======================================================
  // MOVE RECENT FILE TO TRASH
  // =======================================================

  const moveRecentFileToTrash = async (fileId) => {
    try {
      const token =
        localStorage.getItem("token");

      await axios.delete(
        "/api/drive/files",
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },

          data: {
            fileIds: [fileId],
          },
        }
      );

      // Remove the deleted file immediately from the
      // lightweight My Files widget.
      setRecentDriveFiles((previous) =>
        previous.filter(
          (file) => file.id !== fileId
        )
      );

      // Refresh Drive analytics
      const response =
        await getDriveAnalytics();

      setDrive(response.analytics);

      // Refresh Bin count
      try {
        const trashResponse =
          await axios.get(
            "/api/drive/trash",
            {
              headers: {
                Authorization: token,
              },
            }
          );

        setRecentlyDeletedCount(
          trashResponse.data.files?.length || 0
        );
      } catch (trashError) {
        console.error(
          "Trash refresh error:",
          trashError
        );
      }
    } catch (error) {
      console.error(
        "Recent File Delete Error:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Could not move the file to Trash.";

      console.error(message);
    }
  };

  // =======================================================
  // DELETE DIALOG
  // =======================================================

  const requestDeleteRecentFile = (file) => {
    if (!file || file.ownedByMe !== true) {
      return;
    }

    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRecentFile =
    async () => {
      if (
        !fileToDelete?.id ||
        deletingFile
      ) {
        return;
      }

      setDeletingFile(true);

      try {
        await moveRecentFileToTrash(
          fileToDelete.id
        );

        setShowDeleteConfirm(false);
        setFileToDelete(null);
      } finally {
        setDeletingFile(false);
      }
    };

  // =======================================================
  // RECENT FILES
  // =======================================================

  const recentFiles =
    drive?.recentFiles || [];

  const ownedRecentFiles =
    recentFiles.filter(
      (file) => file.ownedByMe === true
    );

  const sharedRecentFiles =
    recentFiles.filter(
      (file) => file.ownedByMe !== true
    );

  const visibleRecentFiles =
    recentFileTab === "owned"
      ? ownedRecentFiles
      : sharedRecentFiles;

  // =======================================================
  // HEALTH
  // =======================================================

  const healthScore =
    Number(health?.score || 0);

  const healthAccent =
    healthScore >= 80
      ? "#34d399"
      : healthScore >= 60
      ? "#f59e0b"
      : "#ef4444";

  // =======================================================
  // DRIVE COUNTS
  // =======================================================

  const largestFileCount =
    drive?.largestFiles?.length || 0;

  const duplicateFileCount =
    drive?.duplicateFiles?.length || 0;

  const recentFileCount =
    drive?.recentFiles?.length || 0;

  // =======================================================
  // SMART CLEANUP RECOMMENDATIONS
  // =======================================================

  const smartRecommendations = [];

  if (largestFileCount > 0) {
    smartRecommendations.push({
      key: "large-files",
      title: "Review large files",
      description: `${largestFileCount} large file${
        largestFileCount === 1 ? "" : "s"
      } are consuming more Drive space than usual.`,
      action: "Review large files",
      icon: Database,
      color: "#fbbf24",
      onClick: () => navigate("/drive-cleanup"),
    });
  }

  if (duplicateFileCount > 0) {
    smartRecommendations.push({
      key: "duplicates",
      title: "Clean up duplicates",
      description: `${duplicateFileCount} duplicate file${
        duplicateFileCount === 1 ? "" : "s"
      } were found and are worth reviewing.`,
      action: "Review duplicates",
      icon: Sparkles,
      color: "#f472b6",
      onClick: () => navigate("/drive-duplicates"),
    });
  }

  if (recentlyDeletedCount > 0) {
    smartRecommendations.push({
      key: "trash",
      title: "Check your Drive Bin",
      description: `${recentlyDeletedCount} file${
        recentlyDeletedCount === 1 ? "" : "s"
      } are currently in Trash and can be restored or permanently deleted.`,
      action: "Open Bin",
      icon: Trash2,
      color: "#34d399",
      onClick: () => navigate("/drive-trash"),
    });
  }

  if (healthScore > 0 && healthScore < 80) {
    smartRecommendations.push({
      key: "health",
      title: "Improve storage health",
      description:
        "SpaceWise detected areas that could be improved. Review the AI health suggestions above.",
      action: "View health",
      icon: ShieldCheck,
      color: "#38bdf8",
      onClick: () => scrollToId("storage-overview"),
    });
  }

  const visibleSmartRecommendations =
    smartRecommendations.slice(0, 3);

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-[#08090c] text-white">
      <style>{`
        .spacewise-action-glow {
          opacity: 0;
          transition: opacity .3s ease;
          animation: spacewise-action-spin 3.8s linear infinite;
        }
        .spacewise-action-shine {
          opacity: 0;
        }
        .spacewise-action-arrow {
          transition: transform .3s ease;
        }
        .spacewise-action:hover .spacewise-action-glow {
          opacity: 1;
        }
        .spacewise-action:hover .spacewise-action-shine {
          opacity: 1;
          animation: spacewise-action-scan 1.1s ease;
        }
        .spacewise-action:hover .spacewise-action-arrow {
          transform: translateX(4px);
        }
        @keyframes spacewise-action-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spacewise-action-scan {
          from { left: -120%; }
          to { left: 150%; }
        }
      `}</style>

      {/* ===================================================
          AMBIENT BACKGROUND
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/[0.035] blur-[130px]" />

        <div className="absolute right-[-200px] top-[30%] h-[500px] w-[500px] rounded-full bg-purple-500/[0.025] blur-[140px]" />

        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.02] blur-[140px]" />

      </div>

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col items-center border-r border-white/[0.06] bg-[#090a0d]/90 py-5 backdrop-blur-xl lg:flex">

        {/* Logo */}

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-sm font-bold text-white shadow-lg">
          S
        </div>

        {/* Navigation */}

        <nav className="mt-10 flex flex-1 flex-col items-center gap-2">

          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            title="Overview"
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07] text-white transition hover:bg-white/[0.1]"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToId(
                "storage-overview"
              )
            }
            title="Storage"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
          >
            <Database className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToId("gmail-intel")
            }
            title="Gmail"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
          >
            <Mail className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToId("cleanup")
            }
            title="Cleanup"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
          >
            <FileStack className="h-4 w-4" />
          </button>

        </nav>

        {/* Bottom */}

        <div className="flex flex-col gap-2">

          <button
            type="button"
            onClick={() =>
              navigate("/settings")
            }
            title="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              setShowLogoutConfirm(true)
            }
            title="Logout"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>

        </div>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="relative min-h-screen lg:ml-[72px]">

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="mb-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                    SPACEWISE
                  </span>

                  <span className="h-1 w-1 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400/70">
                    Dashboard
                  </span>

                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {getGreeting()}, {getDisplayName()}.
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Your digital storage, organized intelligently.
                </p>

              </div>

              {/* Account + Mobile Logout */}

              <div className="flex items-center gap-2">

                <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/[0.075] bg-gradient-to-r from-white/[0.035] to-white/[0.02] px-3 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-semibold text-white ring-1 ring-white/[0.08]">
                    {getAvatarLetter()}
                  </div>

                  <div className="min-w-0">

                    <p className="max-w-[220px] truncate text-xs font-medium text-zinc-200">
                      {gmail?.emailAddress ||
                        "Google Account"}
                    </p>

                    <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-emerald-400">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

                      Connected

                    </p>

                  </div>

                </div>

                {/* Mobile/tablet logout; desktop uses the sidebar logout */}
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Logout"
                  aria-label="Logout"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.05] text-red-400 transition hover:bg-red-400/[0.12] hover:text-red-300 lg:hidden"
                >
                  <LogOut className="h-4 w-4" />
                </button>

              </div>

            </div>

          </header>

          {/* =================================================
              TOP SUMMARY
          ================================================= */}

          <section className="grid gap-3 sm:grid-cols-2">

            {/* Gmail */}

            <div className="group relative overflow-hidden rounded-2xl border border-blue-400/[0.13] bg-gradient-to-br from-blue-500/[0.08] via-[#0d0f13] to-[#0b0d11] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/25">

              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/[0.08] blur-3xl" />

              <div className="relative flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300/60">
                    Gmail
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                    {gmailLoading ? (
                      <Loader2 className="h-7 w-7 animate-spin text-zinc-600" />
                    ) : gmail ? (
                      (
                        gmail.messagesTotal ||
                        0
                      ).toLocaleString()
                    ) : (
                      "—"
                    )}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Total messages
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>

              </div>

            </div>

            {/* Storage */}

            <div className="group relative overflow-hidden rounded-2xl border border-cyan-400/[0.13] bg-gradient-to-br from-cyan-500/[0.07] via-[#0d0f13] to-[#0b0d11] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/25">

              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/[0.07] blur-3xl" />

              <div className="relative flex items-center justify-between gap-5">

                <div className="min-w-0">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/60">
                    Google storage
                  </p>

                  <p className="mt-3 truncate text-2xl font-bold tracking-tight text-white">
                    {driveLoading ? (
                      "Loading..."
                    ) : drive &&
                      storageLimitBytes >
                        0 ? (
                      `${formatStorage(
                        storageUsedBytes
                      )} / ${formatStorage(
                        storageLimitBytes
                      )}`
                    ) : (
                      "—"
                    )}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {drive &&
                    storageLimitBytes >
                      0
                      ? `${storagePercent.toFixed(
                          1
                        )}% used`
                      : "Storage usage"}
                  </p>

                </div>

                {!driveLoading &&
                  storageLimitBytes >
                    0 && (
                    <Ring
                      value={storagePercent}
                      size={54}
                      stroke={5}
                      color="#22d3ee"
                    >
                      <span className="text-[10px] font-bold text-white">
                        {Math.round(
                          storagePercent
                        )}
                        %
                      </span>
                    </Ring>
                  )}

              </div>

            </div>

          </section>

          {/* =================================================
              GOOGLE AI PRO MESSAGE
              Shown for the current AI Pro account.
          ================================================= */}

          {hasAiPro && (
            <div className="mt-3 rounded-xl border border-purple-400/10 bg-purple-400/[0.05] px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />

                <p className="text-xs font-medium text-purple-300">
                  Google AI Pro is active
                </p>
              </div>

              <p className="mt-1 pl-5 text-[10px] text-zinc-500">
                You have access to 5 TB of Google storage.
              </p>
            </div>
          )}

          {/* =================================================
              STORAGE + HEALTH
          ================================================= */}

          <section
            className="mt-4 grid items-stretch gap-4 lg:grid-cols-3"
          >

            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div
              id="storage-overview"
              className="flex flex-col gap-3 scroll-mt-24 lg:col-span-2"
            >

              {/* STORAGE OVERVIEW */}

              <div className="overflow-hidden rounded-[24px] border border-white/[0.075] bg-gradient-to-br from-[#101217] to-[#0c0e12] shadow-[0_16px_50px_rgba(0,0,0,0.14)]">

                <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                        Google Drive
                      </p>

                      <h2 className="mt-1 text-lg font-semibold text-white">
                        Storage overview
                      </h2>

                      <p className="mt-1 text-xs text-zinc-600">
                        Your Drive content breakdown
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
                      <Database className="h-4 w-4 text-cyan-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.06] md:grid-cols-4 md:divide-y-0">

                  {[
                    ["Images", drive?.images, "#38bdf8"],
                    ["Videos", drive?.videos, "#a78bfa"],
                    ["PDFs", drive?.pdfs, "#fb7185"],
                    ["Folders", drive?.folders, "#34d399"],
                  ].map(([label, value, accent], index, arr) => {

                    const max = Math.max(
                      ...arr.map(
                        ([, item]) => Number(item) || 0
                      ),
                      1
                    );

                    return (
                      <div
                        key={label}
                        className="p-5 transition hover:bg-white/[0.015]"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                            {label}
                          </p>

                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: accent }}
                          />
                        </div>

                        <p className="mt-4 text-2xl font-bold tracking-tight text-white">
                          {driveLoading
                            ? "…"
                            : Number(value || 0).toLocaleString()}
                        </p>

                        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: getBarWidth(value, max),
                              background: accent,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>


              {/* =================================================
                  STORAGE INTELLIGENCE
              ================================================= */}

              <div className="relative overflow-hidden rounded-[24px] border border-cyan-400/[0.10] bg-gradient-to-br from-cyan-400/[0.045] via-[#0d0f13] to-[#0d0f13]">

                <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan-400/[0.05] blur-[100px]" />

                <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-60 w-60 rounded-full bg-purple-500/[0.04] blur-[100px]" />

                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.025]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                <div className="relative grid lg:grid-cols-[1fr_230px]">

                  <div className="p-5 sm:p-6">

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/[0.07]">
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/60">
                          SpaceWise Intelligence
                        </p>

                        <div className="flex items-center gap-2">
                          <h3 className="mt-0.5 text-base font-semibold text-white">
                            Storage activity
                          </h3>
                          <span className="rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-emerald-400/70">
                            Live
                          </span>
                        </div>
                      </div>

                    </div>

                    <p className="mt-3 max-w-lg text-sm leading-5 text-zinc-500">
                      SpaceWise is monitoring your Drive and highlighting the areas that may need your attention.
                    </p>

                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2">

                      {/* STORAGE USAGE */}
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                            Storage usage
                          </p>
                          <HardDrive className="h-4 w-4 text-cyan-400" />
                        </div>

                        <p className="mt-3 text-xl font-bold text-white">
                          {driveLoading ? "…" : `${storagePercent.toFixed(0)}%`}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-600">
                          of available Drive storage used
                        </p>
                      </div>

                      {/* LARGE FILES */}
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                            Large files
                          </p>
                          <Database className="h-4 w-4 text-amber-400" />
                        </div>

                        <p className="mt-3 text-xl font-bold text-white">
                          {driveLoading ? "…" : largestFileCount}
                        </p>

                        <p
                          className="mt-1 truncate text-[10px] text-zinc-600"
                          title={drive?.largestFiles?.[0]?.name || ""}
                        >
                          {drive?.largestFiles?.[0]?.name || "No large files detected"}
                        </p>
                      </div>

                      {/* DUPLICATES */}
                      <button
                        type="button"
                        onClick={() => navigate("/drive-duplicates")}
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:border-purple-400/20 hover:bg-purple-400/[0.03]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                            Duplicates
                          </p>
                          <FileStack className="h-4 w-4 text-purple-400" />
                        </div>

                        <p className="mt-3 text-xl font-bold text-white">
                          {driveLoading ? "…" : duplicateFileCount}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-600">
                          duplicate files found · Review →
                        </p>
                      </button>

                      {/* RECENT ACTIVITY */}
                      <div
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                            Recent activity
                          </p>
                          <Clock3 className="h-4 w-4 text-blue-400" />
                        </div>

                        <p className="mt-3 text-xl font-bold text-white">
                          {driveLoading ? "…" : recentFileCount}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-600">
                          recently modified files · View →
                        </p>
                      </div>

                    </div>
                  </div>


                  {/* ANIMATED STORAGE VISUAL */}

                  <div className="relative hidden min-h-[300px] border-l border-white/[0.06] lg:block">

                    <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2">

                      <div className="absolute inset-0 animate-spin rounded-full border border-cyan-400/[0.10] [animation-duration:20s]" />

                      <div className="absolute inset-6 animate-spin rounded-full border border-purple-400/[0.08] [animation-duration:14s] [animation-direction:reverse]" />

                      <div className="absolute inset-12 rounded-full border border-white/[0.05]" />

                      <span className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />

                      <span className="absolute bottom-[10%] right-[7%] h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_14px_rgba(167,139,250,0.8)]" />

                      <span className="absolute bottom-[12%] left-[7%] h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />

                    </div>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">

                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-[#0d0f13] shadow-[0_0_50px_rgba(34,211,238,0.08)]">
                        <HardDrive className="h-7 w-7 text-cyan-400" />
                      </div>

                      <div className="mt-4 text-center">

                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                          Monitoring
                        </p>

                        <div className="mt-1 flex items-center justify-center gap-1.5">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                          <span className="text-[10px] text-emerald-400/70">
                            Active
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>


            {/* =================================================
                STORAGE HEALTH
            ================================================= */}

            <div>

              <div className="relative overflow-hidden rounded-[24px] border border-emerald-400/[0.13] bg-gradient-to-br from-emerald-400/[0.09] via-[#0d0f13] to-[#0b0d11] shadow-[0_16px_50px_rgba(16,185,129,0.06)]">

                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-400/[0.06] blur-3xl" />

                <div className="relative border-b border-white/[0.06] px-5 py-5">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/50">
                    AI insight
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Storage health
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    AI-generated overview
                  </p>

                </div>

                <div className="relative p-5">

                  <div className="flex justify-center">

                    {healthLoading ? (

                      <div className="flex h-36 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-700" />
                      </div>

                    ) : (

                      <Ring
                        value={healthScore}
                        size={150}
                        stroke={10}
                        color={healthAccent}
                      >

                        <div className="flex flex-col items-center">

                          <ShieldCheck
                            className="mb-1 h-4 w-4"
                            style={{ color: healthAccent }}
                          />

                          <span className="text-4xl font-bold tracking-tight text-white">
                            {health?.score ?? "—"}
                          </span>

                          <span
                            className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
                            style={{ color: healthAccent }}
                          >
                            out of 100
                          </span>

                        </div>

                      </Ring>

                    )}

                  </div>

                  <div className="mt-5 space-y-2">

                    {healthLoading ? (

                      <>
                        <div className="h-9 animate-pulse rounded-xl bg-white/[0.04]" />
                        <div className="h-9 animate-pulse rounded-xl bg-white/[0.04]" />
                      </>

                    ) : health?.suggestions?.length ? (

                      health.suggestions
                        .slice(0, 3)
                        .map((suggestion, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3 text-xs leading-5 text-zinc-500"
                          >
                            {suggestion}
                          </div>
                        ))

                    ) : (

                      <div className="flex items-center gap-2 rounded-xl bg-emerald-400/[0.05] p-3">

                        <ShieldCheck className="h-4 w-4 text-emerald-400" />

                        <span className="text-xs text-emerald-400">
                          Storage looks healthy
                        </span>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              AI SMART CLEANUP RECOMMENDATIONS
          ================================================= */}

          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/60">
                  SpaceWise AI
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  Smart cleanup recommendations
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">
                  SpaceWise combines your Drive activity, cleanup signals,
                  Trash status, and storage health to suggest what is worth
                  reviewing first.
                </p>
              </div>

              <Sparkles className="hidden h-5 w-5 text-cyan-400 sm:block" />
            </div>

            {driveLoading || healthLoading ? (
              <div className="grid gap-3 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-40 animate-pulse rounded-[22px] border border-white/[0.06] bg-white/[0.02]"
                  />
                ))}
              </div>
            ) : visibleSmartRecommendations.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {visibleSmartRecommendations.map(
                  ({
                    key,
                    title,
                    description,
                    action,
                    icon: Icon,
                    color,
                    onClick,
                  }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={onClick}
                      className="group relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0d0f13] p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.025]"
                      style={{
                        boxShadow: `inset 0 1px 0 ${color}12`,
                      }}
                    >
                      <div
                        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
                        style={{ background: `${color}12` }}
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ background: `${color}12` }}
                          >
                            <Icon className="h-4 w-4" style={{ color }} />
                          </div>

                          <ArrowRight
                            className="h-4 w-4 text-zinc-700 transition group-hover:translate-x-1"
                            style={{ color: `${color}99` }}
                          />
                        </div>

                        <p className="mt-5 text-sm font-semibold text-zinc-200">
                          {title}
                        </p>

                        <p className="mt-2 min-h-[40px] text-xs leading-5 text-zinc-600">
                          {description}
                        </p>

                        <div
                          className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold"
                          style={{ color }}
                        >
                          {action}
                          <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-[22px] border border-emerald-400/[0.10] bg-emerald-400/[0.025] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-300">
                    Your storage looks clean
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    SpaceWise did not find any immediate cleanup action
                    that needs your attention.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              MY FILES - COMPACT DASHBOARD BOX
          ================================================= */}

          <section className="mt-7">
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0d0f13]">

              {/* Subtle background glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/[0.06] blur-3xl" />

              <div className="relative flex min-h-[150px] flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-7">

                {/* LEFT SIDE */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-400/[0.06]">
                    <Files className="h-6 w-6 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400/60">
                      Google Drive
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                      My Files
                    </h2>

                    <p className="mt-1 text-xs text-zinc-600">
                      Access and manage all your Google Drive files.
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <button
                  type="button"
                  onClick={() => navigate("/files")}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-400/[0.06] px-5 py-3 text-xs font-semibold text-blue-400 transition hover:border-blue-400/30 hover:bg-blue-400/[0.10] hover:text-blue-300"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>
            </div>
          </section>

          {/* =================================================
              GMAIL FULL WIDTH
          ================================================= */}

          <section
            id="gmail-intel"
            className="mt-7 scroll-mt-24"
          >

            <GmailAnalytics
              labels={labels}
            />

          </section>

          {/* =================================================
              CLEANUP INTELLIGENCE
          ================================================= */}

          <section
            id="cleanup"
            className="mt-7 scroll-mt-24"
          >

            <div className="mb-4 flex items-end justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  Smart cleanup
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  Cleanup intelligence
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Find the files worth reviewing first.
                </p>

              </div>

              <Sparkles className="hidden h-5 w-5 text-purple-400 sm:block" />

            </div>

            <div className="grid overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0d0f13] sm:grid-cols-2 xl:grid-cols-4">

              {/* LARGE FILES */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/drive-cleanup"
                  )
                }
                className="group border-b border-white/[0.06] bg-gradient-to-br from-amber-400/[0.025] to-transparent p-5 text-left transition duration-300 hover:bg-amber-400/[0.055] hover:shadow-[inset_0_2px_0_rgba(251,191,36,0.35)] sm:border-r xl:border-b-0"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">

                    <Database className="h-4 w-4 text-amber-400" />

                  </div>

                  <ArrowRight className="h-4 w-4 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-amber-400" />

                </div>

                <p className="mt-5 text-2xl font-bold text-white">
                  {driveLoading
                    ? "…"
                    : largestFileCount}
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-300">
                  Large files
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Top files consuming the most space
                </p>

                <PremiumAction label="Review files" color="#fbbf24" />

              </button>

              {/* DUPLICATES */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/drive-duplicates"
                  )
                }
                className="group border-b border-white/[0.06] bg-gradient-to-br from-pink-400/[0.025] to-transparent p-5 text-left transition duration-300 hover:bg-pink-400/[0.055] hover:shadow-[inset_0_2px_0_rgba(244,114,182,0.35)] xl:border-b-0 xl:border-r"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-400/10">

                    <Sparkles className="h-4 w-4 text-pink-400" />

                  </div>

                  <ArrowRight className="h-4 w-4 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-pink-400" />

                </div>

                <p className="mt-5 text-2xl font-bold text-white">
                  {driveLoading
                    ? "…"
                    : duplicateFileCount}
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-300">
                  Duplicate files
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Groups with identical content
                </p>

                <PremiumAction label="Review duplicates" color="#f472b6" />

              </button>

              {/* RECENT */}

              <button
                type="button"
                onClick={() =>
                  setShowRecentFiles(true)
                }
                className="group border-b border-white/[0.06] bg-gradient-to-br from-blue-400/[0.025] to-transparent p-5 text-left transition duration-300 hover:bg-blue-400/[0.055] hover:shadow-[inset_0_2px_0_rgba(96,165,250,0.35)] sm:border-r xl:border-b-0"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">

                    <Clock3 className="h-4 w-4 text-blue-400" />

                  </div>

                  <ArrowRight className="h-4 w-4 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-blue-400" />

                </div>

                <p className="mt-5 text-2xl font-bold text-white">
                  {driveLoading
                    ? "…"
                    : recentFileCount}
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-300">
                  Recent files
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Recently modified files
                </p>

                <PremiumAction label="View recent files" color="#60a5fa" />

              </button>

              {/* BIN */}

              <button
                type="button"
                onClick={() =>
                  navigate("/drive-trash")
                }
                className="group bg-gradient-to-br from-emerald-400/[0.025] to-transparent p-5 text-left transition duration-300 hover:bg-emerald-400/[0.055] hover:shadow-[inset_0_2px_0_rgba(52,211,153,0.35)]"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">

                    <Trash2 className="h-4 w-4 text-emerald-400" />

                  </div>

                  <ArrowRight className="h-4 w-4 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-emerald-400" />

                </div>

                <p className="mt-5 text-2xl font-bold text-white">
                  {recentlyDeletedCount}
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-300">
                  Recently deleted
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Files currently in Google Drive Bin
                </p>

                <PremiumAction label="Open Bin" color="#34d399" />

              </button>

            </div>

          </section>

          {/* =================================================
              CONNECTED ACCOUNT
          ================================================= */}

          <section className="mt-5">

            <div className="flex flex-col gap-4 rounded-[22px] border border-white/[0.07] bg-[#0d0f13] p-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-semibold text-white">
                  {getDisplayName()
                    ?.charAt(0)
                    .toUpperCase() || "U"}
                </div>

                <div>

                  <p className="text-sm font-medium text-white">
                    {gmail?.emailAddress ||
                      "Google Account"}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-600">
                    Gmail + Google Drive connected
                  </p>

                </div>

              </div>

              <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />

                <span className="text-[10px] font-medium text-emerald-400">
                  Connected
                </span>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* =====================================================
          RECENT FILES MODAL
      ===================================================== */}

      {showRecentFiles && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
          onClick={() =>
            setShowRecentFiles(false)
          }
        >

          <div
            className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#0d0f13] shadow-2xl"
            style={{
              height:
                "min(760px, calc(100vh - 48px))",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">

                  <Files className="h-4 w-4 text-blue-400" />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-white">
                    Recent files
                  </h2>

                  <p className="mt-0.5 text-xs text-zinc-600">
                    Recently modified files in Google Drive
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowRecentFiles(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* BODY */}

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

              {/* TABS */}

              <div className="mb-5 flex rounded-xl border border-white/[0.07] bg-white/[0.025] p-1">

                <button
                  type="button"
                  onClick={() =>
                    setRecentFileTab(
                      "owned"
                    )
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition ${
                    recentFileTab ===
                    "owned"
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  Owned by you

                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-500">
                    {
                      ownedRecentFiles.length
                    }
                  </span>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setRecentFileTab(
                      "shared"
                    )
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition ${
                    recentFileTab ===
                    "shared"
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  Shared by another owner

                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-500">
                    {
                      sharedRecentFiles.length
                    }
                  </span>

                </button>

              </div>

              {/* FILES */}

              {driveLoading ? (

                <div className="flex items-center justify-center py-20 text-sm text-zinc-600">

                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />

                  Loading recent files...

                </div>

              ) : visibleRecentFiles.length ? (

                <div className="space-y-2">

                  {visibleRecentFiles.map(
                    (file, index) => {

                      const isOwned =
                        file.ownedByMe ===
                        true;

                      return (
                        <div
                          key={
                            file.id ||
                            index
                          }
                          className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/[0.11] hover:bg-white/[0.035]"
                        >

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            {/* FILE INFO */}

                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[9px] font-bold text-zinc-500">
                                {getFileIcon(
                                  file.mimeType
                                )}
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-medium text-zinc-200">
                                  {file.name ||
                                    "Unnamed file"}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-2">

                                  <span className="truncate text-[10px] text-zinc-600">
                                    {file.mimeType ||
                                      "Unknown type"}
                                  </span>

                                  <span className="text-zinc-800">
                                    •
                                  </span>

                                  <span
                                    className={`text-[10px] ${
                                      isOwned
                                        ? "text-emerald-400"
                                        : "text-amber-400"
                                    }`}
                                  >
                                    {isOwned
                                      ? "Owned by you"
                                      : "Shared by another owner"}
                                  </span>

                                </div>

                              </div>

                            </div>

                            {/* META + ACTIONS */}

                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">

                              <div className="mr-1 text-right">

                                <p className="text-[10px] text-zinc-500">
                                  {formatDate(
                                    file.modifiedTime
                                  )}
                                </p>

                                {file.size && (
                                  <p className="mt-0.5 text-[10px] text-zinc-700">
                                    {formatStorage(
                                      file.size
                                    )}
                                  </p>
                                )}

                              </div>

                              {/* OPEN */}

                              <button
                                type="button"
                                onClick={() => {

                                  const url =
                                    file.webViewLink;

                                  if (!url) {
                                    console.error(
                                      "No Google Drive view link:",
                                      file.name
                                    );

                                    return;
                                  }

                                  window.open(
                                    url,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );

                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] font-medium text-zinc-300 transition hover:border-blue-400/20 hover:bg-blue-400/[0.06] hover:text-blue-300"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Open
                              </button>

                              {/* DELETE */}

                              {isOwned ? (

                                <button
                                  type="button"
                                  onClick={() =>
                                    requestDeleteRecentFile(
                                      file
                                    )
                                  }
                                  disabled={
                                    deletingFile
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-3 py-2 text-[10px] font-medium text-red-400 transition hover:bg-red-400/[0.09] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>

                              ) : (

                                <span className="inline-flex items-center rounded-xl border border-amber-400/10 bg-amber-400/[0.04] px-3 py-2 text-[10px] font-medium text-amber-400">
                                  View only
                                </span>

                              )}

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              ) : (

                <div className="flex flex-col items-center justify-center py-20 text-center">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">

                    <HardDrive className="h-6 w-6 text-zinc-700" />

                  </div>

                  <p className="mt-4 text-sm font-medium text-zinc-400">
                    No recent files
                  </p>

                  <p className="mt-1 text-xs text-zinc-700">
                    There are no files in this category.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {showDeleteConfirm &&
        fileToDelete && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
            onClick={() => {

              if (!deletingFile) {
                setShowDeleteConfirm(
                  false
                );

                setFileToDelete(null);
              }

            }}
          >

            <div
              className="w-full max-w-md rounded-[24px] border border-white/[0.09] bg-[#0d0f13] p-6 shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400/10">

                  <Trash2 className="h-5 w-5 text-red-400" />

                </div>

                <div className="min-w-0">

                  <h2 className="text-lg font-semibold text-white">
                    Move file to Trash?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    This file will be moved to your
                    Google Drive Bin. You can restore
                    it later or permanently delete it
                    from the Bin.
                  </p>

                  <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">

                    <p className="truncate text-sm font-medium text-zinc-200">
                      {fileToDelete.name ||
                        "Unnamed file"}
                    </p>

                    <p className="mt-1 text-[10px] text-emerald-400">
                      Owned by you
                    </p>

                  </div>

                </div>

              </div>

              <div className="mt-6 flex justify-end gap-2">

                <button
                  type="button"
                  disabled={deletingFile}
                  onClick={() => {

                    setShowDeleteConfirm(
                      false
                    );

                    setFileToDelete(
                      null
                    );

                  }}
                  className="rounded-xl border border-white/[0.07] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deletingFile}
                  onClick={
                    confirmDeleteRecentFile
                  }
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {deletingFile && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}

                  {deletingFile
                    ? "Moving..."
                    : "Move to Trash"}

                </button>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">

          <div className="w-full max-w-sm rounded-[24px] border border-white/[0.09] bg-[#0d0f13] p-6 shadow-2xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10">

              <LogOut className="h-5 w-5 text-red-400" />

            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              Logout from SpaceWise?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Are you sure you want to log out of
              your Google account?
            </p>

            <div className="mt-6 flex justify-end gap-2">

              <button
                type="button"
                onClick={() =>
                  setShowLogoutConfirm(
                    false
                  )
                }
                className="rounded-xl border border-white/[0.07] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {

                  localStorage.removeItem(
                    "token"
                  );

                  localStorage.removeItem(
                    "user"
                  );

                  // Clear temporary session data too
                  sessionStorage.clear();

                  setShowLogoutConfirm(
                    false
                  );

                  navigate("/login", {
                    replace: true,
                  });

                }}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-red-400"
              >
                Logout
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;