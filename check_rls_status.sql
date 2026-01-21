-- Verificar el estado de RLS en todas las tablas del esquema public
-- Esto te ayudará a identificar qué tablas realmente necesitan RLS

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename;

-- Nota: spatial_ref_sys es una tabla del sistema de PostGIS
-- No puedes modificarla directamente y la advertencia puede ser ignorada
