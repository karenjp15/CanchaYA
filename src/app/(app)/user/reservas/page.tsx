import { BookingsTable } from "@/components/bookings/bookings-table";
import { getBookingsByUser } from "@/lib/data/bookings";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const metadata = { title: "Mis reservas" };

export default async function MisReservasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { upcoming, history } = await getBookingsByUser(user.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Mis reservas</h1>
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Próximas ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Historial ({history.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="pt-4">
          <BookingsTable bookings={upcoming} />
        </TabsContent>
        <TabsContent value="history" className="pt-4">
          <BookingsTable bookings={history} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
