-- Solución para ocultar spatial_ref_sys de PostgREST
-- Esta tabla es del sistema PostGIS y no necesita ser expuesta vía API

-- Opción: Revocar permisos de SELECT al rol anon y authenticated
-- Esto evitará que PostgREST la exponga automáticamente
REVOKE SELECT ON TABLE public.spatial_ref_sys FROM anon;
REVOKE SELECT ON TABLE public.spatial_ref_sys FROM authenticated;

-- Nota: Si necesitas acceder a esta tabla desde tu backend,
-- puedes usar el service_role key que tiene acceso completo
