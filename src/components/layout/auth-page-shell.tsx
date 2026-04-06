export function AuthPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[85vh] flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-12">
      {children}
    </div>
  );
}
