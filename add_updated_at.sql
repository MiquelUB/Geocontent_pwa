-- Add updated_at column to legends table
alter table public.legends 
add column if not exists updated_at timestamptz default now();
