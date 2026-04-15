import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AdminDashboardMainSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse border-dashed">
            <CardHeader className="pb-2">
              <div className="h-3 w-24 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <div className="mb-3 h-6 w-48 rounded bg-muted animate-pulse" />
        <div className="h-[min(420px,55vh)] w-full rounded-xl border border-dashed border-muted-foreground/20 bg-muted/20 animate-pulse" />
      </div>
    </div>
  );
}
