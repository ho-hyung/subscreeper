import { Skeleton, SkeletonSubscriptionCard } from "@/components/ui/skeleton";

export default function SubscriptionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>

      {/* Summary */}
      <Skeleton className="h-4 w-32" />

      {/* Subscription Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonSubscriptionCard key={i} />
        ))}
      </div>
    </div>
  );
}
