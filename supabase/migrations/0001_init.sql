-- Ghana Games: tables, row level security and realtime (replaces Firestore).

create table public.admins (email text primary key);

create table public.site_settings (
  id text primary key check (id = 'site'),
  hero_image text check (char_length(hero_image) <= 2000000),
  elder_avatar text check (char_length(elder_avatar) <= 2000000),
  updated_at timestamptz not null default now()
);

create table public.game_assets (
  id text primary key check (id ~ '^[a-z0-9_-]{1,40}$'),
  image text not null check (char_length(image) <= 2000000),
  name text check (char_length(name) <= 120),
  category text check (char_length(category) <= 60),
  updated_at timestamptz not null default now()
);

create table public.story_assets (
  id text primary key check (id ~ '^[a-z0-9_-]{1,40}$'),
  image text not null check (char_length(image) <= 2000000),
  title text check (char_length(title) <= 200),
  updated_at timestamptz not null default now()
);

alter table public.admins enable row level security;        -- no policies: nobody reads it directly
alter table public.site_settings enable row level security;
alter table public.game_assets enable row level security;
alter table public.story_assets enable row level security;

-- True only for a signed-in user whose verified email is listed in public.admins.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
      and coalesce((auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean, false)
  );
$$;

do $$
declare t text;
begin
  foreach t in array array['site_settings','game_assets','story_assets'] loop
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

alter publication supabase_realtime add table public.site_settings, public.game_assets, public.story_assets;

-- After your first Google sign-in, authorise yourself:
-- insert into public.admins (email) values ('you@example.com');
