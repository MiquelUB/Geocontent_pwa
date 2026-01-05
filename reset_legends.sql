-- ALERTA: Aquest script esborrarà TOTES les llegendes de la base de datos.
-- Utilitza'l per netejar les dades "dummy" o de prova.

TRUNCATE TABLE public.legends RESTART IDENTITY;

-- Si volguessis esborrar també els usuaris (Compte!):
-- TRUNCATE TABLE public.profiles CASCADE;
