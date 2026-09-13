import {
  Sparkles,
  HardDrive,
  Image,
  Video,
  FileText,
  Folder,
  ArrowUpRight,
} from "lucide-react";

function StorageAnimation({ drive }) {
  const images = Number(drive?.images || 0);
  const videos = Number(drive?.videos || 0);
  const pdfs = Number(drive?.pdfs || 0);
  const folders = Number(drive?.folders || 0);

  const used = Number(
    drive?.storageQuota?.usage || 0
  );

  const limit = Number(
    drive?.storageQuota?.limit || 0
  );

  const percentage =
    limit > 0
      ? Math.min((used / limit) * 100, 100)
      : 0;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#0c0e12]">

      {/* Ambient glow */}

      <div className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/[0.06] blur-[100px]" />

      <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-violet-500/[0.05] blur-[90px]" />

      {/* Grid */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative grid min-h-[280px] lg:grid-cols-[1fr_320px]">

        {/* LEFT */}

        <div className="flex flex-col justify-center px-7 py-8 sm:px-10">

          {/* Label */}

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.06]">

              <Sparkles className="h-4 w-4 text-cyan-400" />

            </div>

            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/60">
              SpaceWise Intelligence
            </span>

            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-2 py-1 text-[9px] font-medium text-emerald-400">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

              ACTIVE

            </span>

          </div>

          {/* Heading */}

          <h2 className="mt-5 max-w-xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">

            Your storage is{" "}

            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
              under control.
            </span>

          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">

            SpaceWise continuously analyzes your Google Drive and
            highlights where your storage is being used — so you
            know what matters before space becomes a problem.

          </p>

          {/* Stats */}

          <div className="mt-7 flex flex-wrap gap-2">

            <Stat
              icon={Image}
              value={images}
              label="Images"
            />

            <Stat
              icon={Video}
              value={videos}
              label="Videos"
            />

            <Stat
              icon={FileText}
              value={pdfs}
              label="PDFs"
            />

            <Stat
              icon={Folder}
              value={folders}
              label="Folders"
            />

          </div>

          {/* Storage bar */}

          <div className="mt-7 max-w-xl">

            <div className="mb-2 flex items-center justify-between">

              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-700">
                Storage utilization
              </span>

              <span className="text-xs font-medium text-zinc-400">
                {percentage.toFixed(1)}%
              </span>

            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">

              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 transition-all duration-1000"
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* RIGHT VISUAL */}

        <div className="relative hidden overflow-hidden border-l border-white/[0.06] lg:block">

          {/* Orbit */}

          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2">

            <div className="absolute inset-0 animate-[spin_24s_linear_infinite] rounded-full border border-cyan-400/[0.08]" />

            <div className="absolute inset-7 animate-[spin_18s_linear_infinite_reverse] rounded-full border border-violet-400/[0.08]" />

            <div className="absolute inset-14 rounded-full border border-white/[0.06]" />

            {/* orbit dots */}

            <span className="absolute left-1/2 top-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,.8)]" />

            <span className="absolute bottom-[15%] right-[7%] h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,.8)]" />

            <span className="absolute bottom-[18%] left-[8%] h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.8)]" />

          </div>

          {/* Center */}

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">

            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/20 bg-[#0c0e12] shadow-[0_0_60px_rgba(34,211,238,.08)]">

              <div className="absolute inset-2 rounded-full border border-white/[0.04]" />

              <HardDrive className="h-7 w-7 text-cyan-400" />

            </div>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Storage monitor
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Always watching
            </p>

          </div>

          {/* floating insight */}

          <div className="absolute bottom-5 right-5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 backdrop-blur-md">

            <div className="flex items-center gap-2">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

              <span className="text-[10px] text-zinc-500">
                Storage status
              </span>

              <ArrowUpRight className="h-3 w-3 text-zinc-700" />

            </div>

            <p className="mt-1 text-xs font-medium text-emerald-400">
              Looking healthy
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">

      <Icon className="h-3.5 w-3.5 text-zinc-600" />

      <span className="text-xs font-semibold text-zinc-300">
        {Number(value).toLocaleString()}
      </span>

      <span className="text-[10px] text-zinc-700">
        {label}
      </span>

    </div>
  );
}

export default StorageAnimation;