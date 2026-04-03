export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="mb-6 text-xs uppercase tracking-wide text-muted-foreground">
        Administración
      </p>
      {children}
    </div>
  );
}
