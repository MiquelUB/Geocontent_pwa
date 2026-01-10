-- FORCE DELETE ALL LEGENDS
TRUNCATE TABLE public.legends RESTART IDENTITY CASCADE;

-- Optional: if you want to verify
SELECT count(*) FROM public.legends;
