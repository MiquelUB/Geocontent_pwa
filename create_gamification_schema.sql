-- Create visited_legends table
create table if not exists public.visited_legends (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  legend_id uuid references public.legends(id) on delete cascade not null,
  visited_at timestamptz default now(),
  unique(user_id, legend_id) -- Ensure each legend is only "visited" once for points
);

-- Enable RLS
alter table public.visited_legends enable row level security;

-- Policies
create policy "Users can view their own visits" on public.visited_legends
  for select using (auth.uid() = user_id);

create policy "Users can insert their own visits" on public.visited_legends
  for insert with check (auth.uid() = user_id);

-- Add gamification columns to profiles if they don't exist (already handled in previous schema but good enforce)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'xp') then
        alter table public.profiles add column xp integer default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'level') then
        alter table public.profiles add column level integer default 1;
    end if;
     -- We need email in profiles if we are doing simple login lookup
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'email') then
        alter table public.profiles add column email text; 
    end if;
end $$;
