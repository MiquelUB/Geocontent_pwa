-- Enable PostGIS
create extension if not exists postgis;

-- LEGENDS TABLE (Create if not exists)
create table if not exists public.legends (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text not null,
  description text,
  category text not null,
  latitude double precision not null,
  longitude double precision not null,
  location_name text,
  image_url text,
  is_active boolean default true
);

-- Ensure is_active column exists in legends
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'legends' and column_name = 'is_active') then
        alter table public.legends add column is_active boolean default true;
    end if;
end $$;


-- Enable RLS on legends
alter table public.legends enable row level security;

-- Policies for Legends (Drop first to avoid errors if re-running)
drop policy if exists "Public legends are viewable by everyone" on public.legends;
create policy "Public legends are viewable by everyone" on public.legends for select using (true);

drop policy if exists "Admins can insert legends" on public.legends;
create policy "Admins can insert legends" on public.legends for insert with check (
  auth.role() = 'service_role' or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins can update legends" on public.legends;
create policy "Admins can update legends" on public.legends for update using (
  auth.role() = 'service_role' or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins can delete legends" on public.legends;
create policy "Admins can delete legends" on public.legends for delete using (
  auth.role() = 'service_role' or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- PROFILES TABLE (Create if not exists)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamptz,
  username text unique,
  avatar_url text
);

-- Add custom columns to profiles if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
        alter table public.profiles add column role text default 'user';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'xp') then
        alter table public.profiles add column xp integer default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'level') then
        alter table public.profiles add column level integer default 1;
    end if;
end $$;

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for Profiles
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (new.id, new.raw_user_meta_data->>'username', 'user')
  on conflict (id) do nothing; -- Prevent error if profile exists
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user (Drop first to avoid duplication error)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert dummy data for Legends (only if empty to avoid duplicates)
insert into public.legends (title, description, category, latitude, longitude, location_name, image_url)
select 'El Drac de la Noguera', 'Una bèstia llegendària que habitava les aigües del riu Noguera.', 'Criatures', 42.1650, 0.8950, 'Tremp, Pallars Jussà', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
where not exists (select 1 from public.legends limit 1);

insert into public.legends (title, description, category, latitude, longitude, location_name, image_url)
select 'La Dama del Llac Sant Maurici', 'Una misteriosa figura femenina que apareix en les aigües cristal·lines.', 'Fantasmes', 42.5833, 0.9833, 'Espot, Pallars Sobirà', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
where not exists (select 1 from public.legends where title = 'La Dama del Llac Sant Maurici');
