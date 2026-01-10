-- 1. Crear el Bucket 'legendes' (si no existe)
insert into storage.buckets (id, name, public)
values ('legendes', 'legendes', true)
on conflict (id) do nothing;

-- 2. POLÍTICA: Todo el mundo puede VER las imágenes (Público)
create policy "Public Access 2"
on storage.objects for select
using ( bucket_id = 'legendes' );

-- 3. POLÍTICA: Permitir SUBIR imágenes (Usuarios Autenticados + Anon si necesario para pruebas)
-- IMPORTANTE: Si te da problemas el upload desde la app, cambia 'authenticated' por 'anon' temporalmente
create policy "Allow Uploads 2"
on storage.objects for insert
with check ( bucket_id = 'legendes' );

-- RLS ya suele estar activo por defecto en storage.objects, así que no intentamos activarlo de nuevo
-- para evitar el error de permisos.
