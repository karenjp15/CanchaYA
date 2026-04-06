import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export function ProfileFormLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Cargando perfil">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <div className="h-5 w-32 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="size-12 shrink-0 rounded-full bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-3 max-w-xs rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-8 w-full rounded-lg bg-muted" />
              <div className="h-8 w-full rounded-lg bg-muted" />
              <div className="h-8 w-full rounded-lg bg-muted" />
            </div>
            <div className="h-8 w-28 rounded-lg bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-4 w-28 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="h-8 w-32 rounded-lg bg-muted" />
        <div className="h-8 w-36 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
