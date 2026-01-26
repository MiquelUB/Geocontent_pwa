-- 1. Update visited_legends with GPS tracking
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'visited_legends' and column_name = 'lat') then
        alter table public.visited_legends add column lat double precision;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'visited_legends' and column_name = 'lng') then
        alter table public.visited_legends add column lng double precision;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'visited_legends' and column_name = 'accuracy') then
        alter table public.visited_legends add column accuracy double precision;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'visited_legends' and column_name = 'duration_seconds') then
        alter table public.visited_legends add column duration_seconds integer;
    end if;
end $$;

-- 2. Create ratings table
create table if not exists public.ratings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  legend_id uuid references public.legends(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz default now(),
  unique(user_id, legend_id)
);

-- Enable RLS for ratings
alter table public.ratings enable row level security;

-- Policies for ratings
drop policy if exists "Anyone can read ratings" on public.ratings;
create policy "Anyone can read ratings" on public.ratings for select using (true);

drop policy if exists "Users can insert their own ratings" on public.ratings;
create policy "Users can insert their own ratings" on public.ratings for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own ratings" on public.ratings;
create policy "Users can update their own ratings" on public.ratings for update using (auth.uid() = user_id);

-- 3. Update profiles with last_login
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'last_login') then
        alter table public.profiles add column last_login timestamptz;
    end if;
end $$;
