import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function KanbanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-72 max-w-[80vw]" />
        <Skeleton className="h-4 w-96 max-w-[82vw]" />
      </div>
      <div className="flex gap-4 overflow-hidden lg:grid lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, columnIndex) => (
          <div key={columnIndex} className="min-h-[34rem] min-w-72 rounded-lg border border-white/10 bg-white/[0.035] p-3 light:border-slate-200 light:bg-white lg:min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-5" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: columnIndex % 2 ? 3 : 2 }).map((_, cardIndex) => (
                <Card key={cardIndex} className="p-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-2 h-3 w-40" />
                  <Skeleton className="mt-4 h-6 w-20 rounded-full" />
                  <Skeleton className="mt-4 h-3 w-32" />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
