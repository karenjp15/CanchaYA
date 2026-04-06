import Link from "next/link";
import { FieldFormDialog } from "@/components/admin/field-form-dialog";
import { FieldsTable } from "@/components/admin/fields-table";
import { getProfile } from "@/lib/auth/profile";
import { getAllFieldsByOwner } from "@/lib/data/fields";
import { getAllVenuesByOwner } from "@/lib/data/venues";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Gestión de canchas" };

export default async function AdminCanchasPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") redirect("/login");

  const [fields, venues] = await Promise.all([
    getAllFieldsByOwner(profile.id),
    getAllVenuesByOwner(profile.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Canchas</h1>
          <p className="text-sm text-muted-foreground">
            Cada cancha pertenece a un local. Dirección, mapa y servicios se
            configuran en{" "}
            <Link href="/admin/locales" className="font-medium text-primary underline-offset-2 hover:underline">
              Locales
            </Link>
            .
          </p>
        </div>
        {venues.length > 0 ? (
          <FieldFormDialog mode="create" venues={venues} />
        ) : (
          <Link href="/admin/locales" className={cn(buttonVariants())}>
            Crear local primero
          </Link>
        )}
      </div>

      <FieldsTable fields={fields} venues={venues} />
    </div>
  );
}
