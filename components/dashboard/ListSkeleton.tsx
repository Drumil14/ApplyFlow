import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function ListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-80 max-w-[80vw]" />
          <Skeleton className="h-4 w-96 max-w-[82vw]" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <Card className="overflow-hidden">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="grid gap-4 border-b border-white/10 px-5 py-4 last:border-0 light:border-slate-200 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.5fr]">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ml-auto h-8 w-20" />
          </div>
        ))}
      </Card>
    </div>
  );
}
