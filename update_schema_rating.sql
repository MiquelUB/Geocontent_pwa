-- Add rating column to legends table if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'legends' and column_name = 'rating') then
        alter table public.legends add column rating double precision default 0;
    end if;
end $$;
