export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="mb-6 text-xs uppercase tracking-wide text-muted-foreground">
        Jugador
      </p>
      {children}
    </div>
  );
}
