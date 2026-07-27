import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-1">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-72 max-w-[70vw]" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Hero row */}
      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="panel-hero rounded-2xl border border-hairline p-8">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-16 w-40" />
          <Skeleton className="mt-4 h-4 w-64 max-w-full" />
          <Skeleton className="mt-7 h-40 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="panel rounded-2xl border border-hairline p-6">
            <Skeleton className="h-4 w-24" />
            <div className="mt-5 space-y-3.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-2 w-full" />
              ))}
            </div>
          </div>
          <div className="panel rounded-2xl border border-hairline p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-5 h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Stat band */}
      <div className="panel-quiet grid grid-cols-2 divide-x divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline lg:grid-cols-4 lg:divide-y-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="px-6 py-5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-3 h-8 w-14" />
            <Skeleton className="mt-3 h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Lower 3-col */}
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="panel rounded-2xl border border-hairline p-6">
            <Skeleton className="h-4 w-36" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
