-- Reservas insertadas por el seed con billing ficticio (dashboard “lleno”).
-- El dashboard debe reflejar solo reservas reales de jugadores.
DELETE FROM public.bookings
WHERE billing_email = 'demo.reserva@example.com'
  AND billing_last_name = 'Demo';
