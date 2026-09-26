-- Supabase Database Indexes Optimization
-- Ezek az indexek kritikusak a másodpercek alatt lefutó Dashboard lekérdezésekhez,
-- különösen az RLS (Row Level Security) és a nagy adattömeg miatt.

-- Cars tábla gyorsítás (Dashboard első betöltése)
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON public.cars (user_id);

-- Események (tankolás, szerviz) gyorsítása
CREATE INDEX IF NOT EXISTS idx_events_car_id ON public.events (car_id);

-- Teendők (emlékeztetők) gyorsítása
CREATE INDEX IF NOT EXISTS idx_service_reminders_car_id ON public.service_reminders (car_id);
CREATE INDEX IF NOT EXISTS idx_service_reminders_user_id ON public.service_reminders (user_id);

-- Előfizetések gyorsítása
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);

-- Extra: Dátum alapú keresés gyorsítása az eseményeknél (Timeline query-k)
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events (event_date DESC);
