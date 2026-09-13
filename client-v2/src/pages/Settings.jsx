import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Palette,
  Shield,
  Trash2,
  User,
  Settings as SettingsIcon,
} from "lucide-react";

function Settings() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(
    localStorage.getItem("spacewiseNotifications") !== "false"
  );

  const [confirmDelete, setConfirmDelete] = useState(
    localStorage.getItem("spacewiseConfirmDelete") !== "false"
  );

  useEffect(() => {
    localStorage.setItem(
      "spacewiseNotifications",
      String(notifications)
    );
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(
      "spacewiseConfirmDelete",
      String(confirmDelete)
    );
  }, [confirmDelete]);

  const clearLocalHistory = () => {
    localStorage.removeItem("spacewiseRecentlyCleaned");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-8">

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <h1 className="text-lg font-semibold">
                Settings
              </h1>

              <p className="text-xs text-zinc-500">
                Customize your SpaceWise experience
              </p>
            </div>

          </div>

          <SettingsIcon className="h-5 w-5 text-zinc-500" />

        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
            Preferences
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            SpaceWise settings
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Control how your dashboard and cleanup tools behave.
          </p>
        </div>

        <div className="space-y-4">

          {/* Account */}

          <section className="rounded-2xl border border-white/10 bg-[#111113] p-5">
            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400">
                <User className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h3 className="font-medium">
                  Account
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Google account connection used by SpaceWise.
                </p>

                <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] px-4 py-3 text-sm text-emerald-400">
                  Google account connected
                </div>
              </div>

            </div>
          </section>

          {/* Appearance */}

          <section className="rounded-2xl border border-white/10 bg-[#111113] p-5">
            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
                <Palette className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h3 className="font-medium">
                  Appearance
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  SpaceWise uses a dark storage-focused interface.
                </p>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-300">
                        Dark interface
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        Optimized for the SpaceWise dashboard.
                      </p>
                    </div>

                    <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-400">
                      Active
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* Notifications */}

          <section className="rounded-2xl border border-white/10 bg-[#111113] p-5">
            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                <Bell className="h-5 w-5" />
              </div>

              <div className="flex-1">

                <h3 className="font-medium">
                  Notifications
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Control cleanup and storage notifications.
                </p>

                <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">

                  <div>
                    <p className="text-sm text-zinc-300">
                      Cleanup notifications
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Allow SpaceWise to show cleanup reminders.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) =>
                      setNotifications(e.target.checked)
                    }
                    className="h-4 w-4"
                  />

                </label>

              </div>

            </div>
          </section>

          {/* Safety */}

          <section className="rounded-2xl border border-white/10 bg-[#111113] p-5">
            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
                <Shield className="h-5 w-5" />
              </div>

              <div className="flex-1">

                <h3 className="font-medium">
                  Cleanup safety
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Protect yourself from accidental cleanup actions.
                </p>

                <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">

                  <div>
                    <p className="text-sm text-zinc-300">
                      Confirm before deleting
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Ask for confirmation before moving files to Trash.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={(e) =>
                      setConfirmDelete(e.target.checked)
                    }
                    className="h-4 w-4"
                  />

                </label>

              </div>

            </div>
          </section>

          {/* Local history */}

          <section className="rounded-2xl border border-red-400/10 bg-red-400/[0.02] p-5">
            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>

              <div className="flex-1">

                <h3 className="font-medium">
                  Local cleanup history
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Clear SpaceWise's locally saved cleanup history.
                  This does not permanently delete anything from Google Drive.
                </p>

                <button
                  onClick={clearLocalHistory}
                  className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-400/20"
                >
                  Clear local history
                </button>

              </div>

            </div>
          </section>

        </div>

      </main>
    </div>
  );
}

export default Settings;