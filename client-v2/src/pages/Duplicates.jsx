import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  HardDrive,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { getDriveAnalytics } from "../services/driveApi";

function Duplicates() {
  const navigate = useNavigate();

  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadDuplicates = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const response = await axios.get(
      "/api/drive/analytics",
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

    setDuplicateGroups(
      analytics.ownedDuplicates ||
        analytics.duplicateFiles ||
        []
    );

    setSharedDuplicateGroups(
      analytics.sharedDuplicates ||
        []
    );

    setMixedDuplicateGroups(
      analytics.mixedDuplicates ||
        []
    );

  } catch (err) {
    console.error(
      "Duplicate Load Error:",
      err
    );

    setError(
      err.response?.data?.message ||
        "Unable to load duplicate files."
    );
  } finally {
    setLoading(false);
  }
};
    loadDuplicates();
  }, []);

  // Convert bytes to readable size
  const formatSize = (bytes) => {
    const size = Number(bytes || 0);

    if (size === 0) {
      return "Unknown size";
    }

    const mb = size / (1024 * 1024);

    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }

    return `${mb.toFixed(1)} MB`;
  };

  // Calculate duplicate statistics
  const totalGroups = duplicates.length;

  const totalCopies = duplicates.reduce(
    (total, group) => {
      return total + (group.files?.length || 0);
    },
    0
  );

  /*
    Potential recovery assumes one copy from each
    duplicate group is kept.

    IMPORTANT:
    Matching filenames do not guarantee identical
    file contents, so this is only an estimate.
  */
  const potentialRecoveryBytes = duplicates.reduce(
    (total, group) => {
      if (!group.files || group.files.length <= 1) {
        return total;
      }

      const sizes = group.files.map((file) =>
        Number(file.size || 0)
      );

      const totalSize = sizes.reduce(
        (sum, size) => sum + size,
        0
      );

      const largestSize = Math.max(...sizes);

      return total + (totalSize - largestSize);
    },
    0
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">

          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              SpaceWise
            </h1>

            <p className="text-xs text-zinc-500">
              Storage intelligence
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

        </div>

      </header>


      {/* Main */}
      <main className="mx-auto max-w-7xl px-8 py-10">

        {/* Page heading */}
        <div className="mb-8">

          <div className="mb-3 flex items-center gap-2">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <Copy className="h-5 w-5 text-zinc-400" />
            </div>

            <span className="text-sm text-zinc-500">
              Storage cleanup
            </span>

          </div>

          <h2 className="text-4xl font-semibold tracking-tight">
            Duplicate files
          </h2>

          <p className="mt-2 text-zinc-400">
            Review files with the same name that may be
            taking up unnecessary storage.
          </p>

        </div>


        {/* Summary cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          {/* Duplicate Groups */}
          <Card className="border-white/10 bg-[#111113] text-white shadow-none">

            <CardContent className="p-6">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-zinc-500">
                    Duplicate groups
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {loading ? "..." : totalGroups}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Groups with matching names
                  </p>
                </div>

                <Copy className="h-5 w-5 text-zinc-500" />

              </div>

            </CardContent>

          </Card>


          {/* Duplicate Copies */}
          <Card className="border-white/10 bg-[#111113] text-white shadow-none">

            <CardContent className="p-6">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-zinc-500">
                    Duplicate copies
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {loading ? "..." : totalCopies}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Files across duplicate groups
                  </p>
                </div>

                <HardDrive className="h-5 w-5 text-zinc-500" />

              </div>

            </CardContent>

          </Card>


          {/* Potential Recovery */}
          <Card className="border-white/10 bg-[#111113] text-white shadow-none">

            <CardContent className="p-6">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm text-zinc-500">
                    Potential recovery
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {loading
                      ? "..."
                      : formatSize(potentialRecoveryBytes)}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    If one copy is retained
                  </p>
                </div>

                <HardDrive className="h-5 w-5 text-zinc-500" />

              </div>

            </CardContent>

          </Card>

        </div>


        {/* Information note */}
        {!loading && duplicates.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-400/10 bg-amber-400/[0.04] px-4 py-3 text-xs text-amber-300/80">
            Potential recovery is an estimate based on matching
            file names. SpaceWise does not assume that files with
            the same name have identical contents.
          </div>
        )}


        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />

              <p className="text-sm text-zinc-500">
                Scanning your Google Drive...
              </p>

            </div>

          </div>
        )}


        {/* No duplicates */}
        {!loading && duplicates.length === 0 && (

          <Card className="border-white/10 bg-[#111113] text-white shadow-none">

            <CardContent className="flex flex-col items-center justify-center py-16">

              <Copy className="mb-4 h-10 w-10 text-zinc-600" />

              <h3 className="text-lg font-medium">
                No duplicate groups found
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Your Drive looks clean based on file names.
              </p>

            </CardContent>

          </Card>

        )}


        {/* Duplicate Groups */}
        {!loading && duplicates.length > 0 && (

          <div className="space-y-4">

            {duplicates.map((group, groupIndex) => {

              const groupSizes = (group.files || []).map(
                (file) => Number(file.size || 0)
              );

              const groupTotalSize = groupSizes.reduce(
                (sum, size) => sum + size,
                0
              );

              const groupLargestSize =
                groupSizes.length > 0
                  ? Math.max(...groupSizes)
                  : 0;

              const groupRecovery =
                groupTotalSize - groupLargestSize;

              return (

                <Card
                  key={`${group.name}-${groupIndex}`}
                  className="border-white/10 bg-[#111113] text-white shadow-none"
                >

                  <CardHeader>

                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">

                        <CardTitle className="truncate text-base font-medium">
                          {group.name}
                        </CardTitle>

                        <p className="mt-1 text-sm text-zinc-500">
                          {group.count} copies found
                        </p>

                      </div>

                      <span className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-400">
                        Duplicate
                      </span>

                    </div>

                  </CardHeader>


                  <CardContent>

                    {/* Files */}
                    <div className="space-y-2">

                      {(group.files || []).map((file) => (

                        <div
                          key={file.id}
                          className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.05]"
                        >

                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium text-zinc-300">
                              {file.name}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">

                              {formatSize(file.size)}

                              {" · "}

                              {file.modifiedTime
                                ? new Date(
                                    file.modifiedTime
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "Unknown date"}

                            </p>

                          </div>


                          <a
                            href={`https://drive.google.com/file/d/${file.id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
                          >
                            Open
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                        </div>

                      ))}

                    </div>


                    {/* Group storage impact */}
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">

                      <div>

                        <p className="text-xs text-zinc-500">
                          Potential recovery
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-300">
                          {formatSize(groupRecovery)}
                        </p>

                      </div>

                      <p className="text-xs text-zinc-600">
                        Keep one copy
                      </p>

                    </div>

                  </CardContent>

                </Card>

              );
            })}

          </div>

        )}

      </main>

    </div>
  );
}

export default Duplicates;