-- 1. Remove UNIQUE constraint on username if it exists (Critical for allow duplicate names)
alter table public.profiles drop constraint if exists profiles_username_key;

-- 2. Add email column if it doesn't exist
alter table public.profiles add column if not exists email text;

-- 3. Replace the Trigger Function to be Exception-Safe
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Try to insert profile. 
  -- We include 'email' from new.email
  -- We use COALESCE to ensure username is not null
  insert into public.profiles (id, username, role, email, xp, level)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', 'Adventurer'), 
    'user',
    new.email,
    0,
    1
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username; 
    -- If it exists (race condition), just update it.
  
  return new;
exception
  when others then
    -- Catch all errors in trigger to prevent blocking user creation
    -- Logs error to postgres logs but allows transaction to commit
    raise warning 'Error in handle_new_user trigger: %', SQLERRM;
    return new;
end;
$$ language plpgsql security definer;

-- 4. Re-create the trigger to ensure it uses the latest function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Ensure visited_legends table exists 
create table if not exists public.visited_legends (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  legend_id uuid references public.legends(id) on delete cascade not null,
  visited_at timestamptz default now(),
  unique(user_id, legend_id)
);

-- 6. Enable RLS on visited_legends
alter table public.visited_legends enable row level security;
drop policy if exists "Enable all for service role" on public.visited_legends;
create policy "Enable all for service role" on public.visited_legends using (true) with check (true);
