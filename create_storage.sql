-- 1. Crear el Bucket 'legendes' (si no existe)
insert into storage.buckets (id, name, public)
values ('legendes', 'legendes', true)
on conflict (id) do nothing;

-- 2. Habilitar RLS (Row Level Security) para seguridad
alter table storage.objects enable row level security;

-- 3. POLÍTICA: Todo el mundo puede VER las imágenes (Público)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'legendes' );

-- 4. POLÍTICA: Permitir SUBIR imágenes
-- Opción A: Solo usuarios autenticados (Recomendado)
create policy "Authenticated users can upload"
on storage.objects for insert
with check ( bucket_id = 'legendes' and auth.role() = 'authenticated' );

-- Opción B: Todo el mundo puede subir (Solo para desarrollo/pruebas, descomentar si necesario)
-- create policy "Anyone can upload"
-- on storage.objects for insert
-- with check ( bucket_id = 'legendes' );

-- 5. POLÍTICA: Permitir EDITAR/BORRAR sus propias imágenes (Opcional)
create policy "Users can update own images"
on storage.objects for update
using ( bucket_id = 'legendes' and auth.uid() = owner );

create policy "Users can delete own images"
on storage.objects for delete
using ( bucket_id = 'legendes' and auth.uid() = owner );
