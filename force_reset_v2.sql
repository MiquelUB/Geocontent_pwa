-- ⚠️ PELIGRO: ESTE SCRIPT BORRARA TODO ⚠️

-- 1. Borrar todas las entradas de la tabla legends (y cualquier cosa vinculada)
TRUNCATE TABLE public.legends RESTART IDENTITY CASCADE;

-- 2. Asegurar que los cambios se apliquen inmediatamente
COMMIT;

-- 3. Verificación (debería dar 0)
SELECT count(*) as total_legends FROM public.legends;
