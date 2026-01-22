import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="p-4 space-y-4">
          {/* Toggle Item */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>

          {/* Email Info */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>

          {/* Test Button */}
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
