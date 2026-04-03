type Props = { params: Promise<{ id: string }> };

export default async function CanchaDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Reservar cancha</h1>
      <p className="mt-2 text-muted-foreground">
        Detalle y selector estilo Calendly / Google Calendar — cancha{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{id}</code>
      </p>
    </div>
  );
}
