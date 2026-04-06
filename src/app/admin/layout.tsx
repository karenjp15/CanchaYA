import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh min-h-0 flex-col md:h-dvh md:flex-row md:overflow-hidden">
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
