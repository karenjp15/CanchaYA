import { FieldFormDialog } from "@/components/admin/field-form-dialog";
import { FieldsTable } from "@/components/admin/fields-table";
import { getProfile } from "@/lib/auth/profile";
import { getAllFieldsByOwner } from "@/lib/data/fields";
import { redirect } from "next/navigation";

export const metadata = { title: "Gestión de canchas" };

export default async function AdminCanchasPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") redirect("/login");

  const fields = await getAllFieldsByOwner(profile.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de canchas</h1>
          <p className="text-sm text-muted-foreground">
            Crea, edita y activa/desactiva canchas
          </p>
        </div>
        <FieldFormDialog mode="create" />
      </div>

      <FieldsTable fields={fields} />
    </div>
  );
}
