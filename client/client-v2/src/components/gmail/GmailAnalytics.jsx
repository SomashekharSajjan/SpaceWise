import {
  Mail,
  Inbox,
  Megaphone,
  Users,
  RefreshCw,
  User,
  AlertTriangle,
  Trash2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

function GmailAnalytics({ labels }) {
  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------
  if (!labels) {
    return (
      <section className="mt-8">
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/[0.06]">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Gmail Intelligence
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Loading Gmail data...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------------------
  // Gmail categories
  // --------------------------------------------------
  const displayLabels = labels.filter((label) =>
    [
      "INBOX",
      "CATEGORY_PROMOTIONS",
      "CATEGORY_SOCIAL",
      "CATEGORY_UPDATES",
      "CATEGORY_PERSONAL",
      "SPAM",
      "TRASH",
    ].includes(label.name)
  );

  // --------------------------------------------------
  // Label information
  // --------------------------------------------------
  const getLabelInfo = (name) => {
    switch (name) {
      case "INBOX":
        return {
          title: "Inbox",
          description: "Messages in your inbox",
          icon: Inbox,
          accent: "blue",
          color: "text-blue-400",
          bg: "bg-blue-400/[0.07]",
          border: "border-blue-400/20",
        };

      case "CATEGORY_PROMOTIONS":
        return {
          title: "Promotions",
          description: "Promotional emails",
          icon: Megaphone,
          accent: "violet",
          color: "text-violet-400",
          bg: "bg-violet-400/[0.07]",
          border: "border-violet-400/20",
        };

      case "CATEGORY_SOCIAL":
        return {
          title: "Social",
          description: "Social notifications",
          icon: Users,
          accent: "pink",
          color: "text-pink-400",
          bg: "bg-pink-400/[0.07]",
          border: "border-pink-400/20",
        };

      case "CATEGORY_UPDATES":
        return {
          title: "Updates",
          description: "Updates and notifications",
          icon: RefreshCw,
          accent: "cyan",
          color: "text-cyan-400",
          bg: "bg-cyan-400/[0.07]",
          border: "border-cyan-400/20",
        };

      case "CATEGORY_PERSONAL":
        return {
          title: "Personal",
          description: "Personal messages",
          icon: User,
          accent: "amber",
          color: "text-amber-400",
          bg: "bg-amber-400/[0.07]",
          border: "border-amber-400/20",
        };

      case "SPAM":
        return {
          title: "Spam",
          description: "Messages marked as spam",
          icon: AlertTriangle,
          accent: "yellow",
          color: "text-yellow-400",
          bg: "bg-yellow-400/[0.07]",
          border: "border-yellow-400/20",
        };

      case "TRASH":
        return {
          title: "Trash",
          description: "Deleted messages",
          icon: Trash2,
          accent: "red",
          color: "text-red-400",
          bg: "bg-red-400/[0.07]",
          border: "border-red-400/20",
        };

      default:
        return {
          title: name,
          description: "Gmail messages",
          icon: Mail,
          accent: "blue",
          color: "text-blue-400",
          bg: "bg-blue-400/[0.07]",
          border: "border-blue-400/20",
        };
    }
  };

  // --------------------------------------------------
  // Find labels
  // --------------------------------------------------
  const getLabel = (name) =>
    labels.find((label) => label.name === name);

  const promotions = getLabel("CATEGORY_PROMOTIONS");
  const social = getLabel("CATEGORY_SOCIAL");
  const updates = getLabel("CATEGORY_UPDATES");
  const spam = getLabel("SPAM");
  const trash = getLabel("TRASH");

  // --------------------------------------------------
  // Cleanup recommendations
  // --------------------------------------------------
  const recommendations = [];

  if (promotions && Number(promotions.messages) > 1000) {
    recommendations.push({
      type: "Promotions",
      title: "Review promotional emails",
      description: `${Number(
        promotions.messages
      ).toLocaleString()} promotional messages are in your Gmail.`,
      icon: Megaphone,
      color: "violet",
    });
  }

  if (trash && Number(trash.messages) > 0) {
    recommendations.push({
      type: "Trash",
      title: "Review your Trash",
      description: `${Number(
        trash.messages
      ).toLocaleString()} messages are currently in Trash.`,
      icon: Trash2,
      color: "red",
    });
  }

  if (spam && Number(spam.messages) > 0) {
    recommendations.push({
      type: "Spam",
      title: "Review Spam",
      description: `${Number(
        spam.messages
      ).toLocaleString()} messages are marked as spam.`,
      icon: AlertTriangle,
      color: "yellow",
    });
  }

  if (social && Number(social.messages) > 1000) {
    recommendations.push({
      type: "Social",
      title: "Review social notifications",
      description: `${Number(
        social.messages
      ).toLocaleString()} social messages may need attention.`,
      icon: Users,
      color: "pink",
    });
  }

  if (updates && Number(updates.messages) > 2000) {
    recommendations.push({
      type: "Updates",
      title: "Review update emails",
      description: `${Number(
        updates.messages
      ).toLocaleString()} update messages are in your Gmail.`,
      icon: RefreshCw,
      color: "cyan",
    });
  }

  // --------------------------------------------------
  // Review action
  // --------------------------------------------------
  const handleReview = (type) => {
    window.location.href = `/gmail-cleanup?type=${type.toLowerCase()}`;
  };

  // --------------------------------------------------
  // Color helpers
  // --------------------------------------------------
  const getRecommendationStyles = (color) => {
    const styles = {
      violet: {
        icon:
          "border-violet-400/20 bg-violet-400/[0.07] text-violet-400",
        button:
          "border-violet-400/25 bg-violet-400/[0.04] text-violet-400 hover:border-violet-400/60 hover:bg-violet-400/[0.10] hover:shadow-[0_0_25px_rgba(167,139,250,0.12)]",
      },

      red: {
        icon:
          "border-red-400/20 bg-red-400/[0.07] text-red-400",
        button:
          "border-red-400/25 bg-red-400/[0.04] text-red-400 hover:border-red-400/60 hover:bg-red-400/[0.10] hover:shadow-[0_0_25px_rgba(248,113,113,0.12)]",
      },

      yellow: {
        icon:
          "border-yellow-400/20 bg-yellow-400/[0.07] text-yellow-400",
        button:
          "border-yellow-400/25 bg-yellow-400/[0.04] text-yellow-400 hover:border-yellow-400/60 hover:bg-yellow-400/[0.10] hover:shadow-[0_0_25px_rgba(250,204,21,0.12)]",
      },

      pink: {
        icon:
          "border-pink-400/20 bg-pink-400/[0.07] text-pink-400",
        button:
          "border-pink-400/25 bg-pink-400/[0.04] text-pink-400 hover:border-pink-400/60 hover:bg-pink-400/[0.10] hover:shadow-[0_0_25px_rgba(244,114,182,0.12)]",
      },

      cyan: {
        icon:
          "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-400",
        button:
          "border-cyan-400/25 bg-cyan-400/[0.04] text-cyan-400 hover:border-cyan-400/60 hover:bg-cyan-400/[0.10] hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]",
      },
    };

    return styles[color] || styles.cyan;
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <section className="mt-8 w-full">
      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-400/[0.06] shadow-[0_0_25px_rgba(59,130,246,0.08)]">
              <Mail className="h-5 w-5 text-blue-400" />

              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Gmail Intelligence
                </h2>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Live
                </span>
              </div>

              <p className="mt-1 text-sm text-zinc-500">
                AI-powered overview of your Gmail activity
              </p>
            </div>
          </div>
        </div>

        <div className="hidden rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-zinc-500 sm:block">
          {displayLabels.length} categories
        </div>
      </div>

      {/* ==================================================
          GMAIL CATEGORY CARDS
      ================================================== */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {displayLabels.map((label) => {
          const info = getLabelInfo(label.name);
          const Icon = info.icon;

          const messages = Number(label.messages || 0);
          const threads = Number(label.threads || 0);

          const maxMessages = Math.max(
            ...displayLabels.map((item) =>
              Number(item.messages || 0)
            ),
            1
          );

          const percentage = Math.min(
            100,
            Math.max(4, (messages / maxMessages) * 100)
          );

          return (
            <div
              key={label.id}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.09]
                bg-[#111216]
                p-5
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-white/[0.18]
                hover:bg-[#141519]
                hover:shadow-[0_12px_35px_rgba(0,0,0,0.28)]
              "
            >
              {/* subtle glow */}
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${info.bg} opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100`}
              />

              {/* Header */}
              <div className="relative flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${info.border} ${info.bg}`}
                >
                  <Icon className={`h-4.5 w-4.5 ${info.color}`} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {info.title}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-zinc-600">
                    {info.description}
                  </p>
                </div>
              </div>

              {/* Numbers */}
              <div className="relative mt-7 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold tracking-tight text-white">
                    {messages.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    messages
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-400">
                    {threads.toLocaleString()}
                  </p>

                  <p className="mt-1 text-[11px] text-zinc-600">
                    threads
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full ${info.bg.replace(
                    "[0.07]",
                    "[0.85]"
                  )} transition-all duration-700`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================
          WORTH YOUR ATTENTION
      ================================================== */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#101114]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/[0.06]">
              <Sparkles className="h-4 w-4 text-violet-400" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">
                Worth your attention
              </h3>

              <p className="mt-0.5 text-xs text-zinc-600">
                SpaceWise found areas that may need review.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-zinc-500">
            {recommendations.length}{" "}
            {recommendations.length === 1
              ? "suggestion"
              : "suggestions"}
          </span>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {recommendations.map((item, index) => {
              const Icon = item.icon;
              const styles = getRecommendationStyles(
                item.color
              );

              return (
                <div
                  key={`${item.type}-${index}`}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-white/[0.018]
                    p-5
                    transition-all
                    duration-300
                    hover:border-white/[0.15]
                    hover:bg-white/[0.03]
                  "
                >
                  {/* Accent glow */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/[0.025] blur-3xl transition-all duration-500 group-hover:bg-white/[0.05]" />

                  <div className="relative flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-200">
                        {item.title}
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                        {item.description}
                      </p>

                      {/* PREMIUM REVIEW BUTTON */}
                      <button
                        type="button"
                        onClick={() =>
                          handleReview(item.type)
                        }
                        className={`
                          group/review
                          mt-4
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          px-4
                          py-2
                          text-xs
                          font-semibold
                          transition-all
                          duration-300
                          ${styles.button}
                        `}
                      >
                        <span>Review now</span>

                        <ArrowUpRight
                          className="
                            h-3.5
                            w-3.5
                            transition-transform
                            duration-300
                            group-hover/review:-translate-y-0.5
                            group-hover/review:translate-x-0.5
                          "
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06]">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    Gmail looks healthy
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    No major cleanup opportunities were
                    detected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default GmailAnalytics;