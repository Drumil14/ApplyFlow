import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-72 max-w-[80vw]" />
          <Skeleton className="h-4 w-96 max-w-[82vw]" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="mt-5 h-9 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-6 h-72 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-5 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5">
          <Skeleton className="h-5 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <Skeleton className="h-5 w-36" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="mt-1 h-2 w-2 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
