import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-80 max-w-[80vw]" />
        <Skeleton className="h-4 w-96 max-w-[82vw]" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <Skeleton className="h-[32rem] w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="mt-5 h-20 w-full" />
          <Skeleton className="mt-5 h-36 w-full" />
        </Card>
      </div>
    </div>
  );
}
