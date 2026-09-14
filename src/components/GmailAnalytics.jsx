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
} from "lucide-react";

function GmailAnalytics({ labels }) {
  if (!labels) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#111113] p-6 text-white">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-zinc-500" />

          <div>
            <h3 className="text-base font-medium">
              Gmail Analytics
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Loading Gmail data...
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  const getLabelInfo = (name) => {
    switch (name) {
      case "INBOX":
        return {
          title: "Inbox",
          description: "Messages in your inbox",
          icon: Inbox,
        };

      case "CATEGORY_PROMOTIONS":
        return {
          title: "Promotions",
          description: "Promotional emails",
          icon: Megaphone,
        };

      case "CATEGORY_SOCIAL":
        return {
          title: "Social",
          description: "Social notifications",
          icon: Users,
        };

      case "CATEGORY_UPDATES":
        return {
          title: "Updates",
          description: "Updates and notifications",
          icon: RefreshCw,
        };

      case "CATEGORY_PERSONAL":
        return {
          title: "Personal",
          description: "Personal messages",
          icon: User,
        };

      case "SPAM":
        return {
          title: "Spam",
          description: "Messages marked as spam",
          icon: AlertTriangle,
        };

      case "TRASH":
        return {
          title: "Trash",
          description: "Deleted messages",
          icon: Trash2,
        };

      default:
        return {
          title: name,
          description: "Gmail messages",
          icon: Mail,
        };
    }
  };

  // Find specific Gmail labels
  const getLabel = (name) =>
    labels.find((label) => label.name === name);

  const promotions = getLabel("CATEGORY_PROMOTIONS");
  const social = getLabel("CATEGORY_SOCIAL");
  const updates = getLabel("CATEGORY_UPDATES");
  const spam = getLabel("SPAM");
  const trash = getLabel("TRASH");

  // Create cleanup recommendations
  const recommendations = [];

  if (promotions && Number(promotions.messages) > 1000) {
    recommendations.push({
      title: "Review promotional emails",
      description: `${Number(
        promotions.messages
      ).toLocaleString()} promotional messages are in your Gmail.`,
      icon: Megaphone,
      type: "Promotions",
    });
  }

  if (trash && Number(trash.messages) > 0) {
    recommendations.push({
      title: "Review your Trash",
      description: `${Number(
        trash.messages
      ).toLocaleString()} messages are currently in Trash.`,
      icon: Trash2,
      type: "Trash",
    });
  }

  if (spam && Number(spam.messages) > 0) {
    recommendations.push({
      title: "Review Spam",
      description: `${Number(
        spam.messages
      ).toLocaleString()} messages are marked as spam.`,
      icon: AlertTriangle,
      type: "Spam",
    });
  }

  if (social && Number(social.messages) > 1000) {
    recommendations.push({
      title: "Review social notifications",
      description: `${Number(
        social.messages
      ).toLocaleString()} social messages may need attention.`,
      icon: Users,
      type: "Social",
    });
  }

  if (updates && Number(updates.messages) > 2000) {
    recommendations.push({
      title: "Review update emails",
      description: `${Number(
        updates.messages
      ).toLocaleString()} update messages are in your Gmail.`,
      icon: RefreshCw,
      type: "Updates",
    });
  }

  return (
    <div className="mt-6">

      {/* Gmail Intelligence Header */}
      <div className="mb-4">

        <div className="flex items-center gap-2">

          <Mail className="h-5 w-5 text-zinc-500" />

          <h2 className="text-lg font-semibold text-white">
            Gmail Intelligence
          </h2>

        </div>

        <p className="mt-1 text-sm text-zinc-500">
          Understand where your Gmail activity is concentrated.
        </p>

      </div>


      {/* Gmail Category Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {displayLabels.map((label) => {

          const info = getLabelInfo(label.name);
          const Icon = info.icon;

          return (
            <div
              key={label.id}
              className="rounded-xl border border-white/10 bg-[#111113] p-5 text-white transition hover:border-white/20 hover:bg-white/[0.03]"
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <Icon className="h-4 w-4 text-zinc-500" />
                  </div>

                  <div>

                    <p className="text-sm font-medium">
                      {info.title}
                    </p>

                    <p className="mt-0.5 text-[11px] text-zinc-600">
                      {info.description}
                    </p>

                  </div>

                </div>

              </div>


              <div className="mt-5 flex items-end justify-between">

                <div>

                  <p className="text-2xl font-semibold">
                    {Number(
                      label.messages || 0
                    ).toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    messages
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-sm font-medium text-zinc-400">
                    {Number(
                      label.threads || 0
                    ).toLocaleString()}
                  </p>

                  <p className="mt-1 text-[11px] text-zinc-600">
                    threads
                  </p>

                </div>

              </div>

            </div>
          );
        })}

      </div>


      {/* Gmail Cleanup Intelligence */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#111113] p-6">

        <div className="mb-5 flex items-start justify-between">

          <div>

            <div className="flex items-center gap-2">

              <Sparkles className="h-5 w-5 text-zinc-500" />

              <h3 className="text-base font-semibold text-white">
                Gmail Cleanup Intelligence
              </h3>

            </div>

            <p className="mt-1 text-sm text-zinc-500">
              SpaceWise found these areas that may need attention.
            </p>

          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-500">
            {recommendations.length} suggestions
          </span>

        </div>


        {recommendations.length > 0 ? (

          <div className="grid gap-3 md:grid-cols-2">

            {recommendations.map((item, index) => {

              const Icon = item.icon;

              return (
                <div
                  key={`${item.type}-${index}`}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
                >

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">

                      <Icon className="h-4 w-4 text-zinc-500" />

                    </div>


                    <div className="min-w-0">

                      <p className="text-sm font-medium text-zinc-300">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        {item.description}
                      </p>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        ) : (

          <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-5">

            <p className="text-sm font-medium text-emerald-400">
              Gmail looks healthy
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              No major cleanup opportunities were detected from
              the available Gmail categories.
            </p>

          </div>

        )}

      </div>


      {/* Empty State */}
      {displayLabels.length === 0 && (

        <div className="mt-4 rounded-xl border border-white/10 bg-[#111113] p-8 text-center">

          <Mail className="mx-auto h-8 w-8 text-zinc-600" />

          <p className="mt-3 text-sm text-zinc-400">
            No Gmail category data available.
          </p>

        </div>

      )}

    </div>
  );
}

export default GmailAnalytics;