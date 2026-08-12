-- Run this once in Supabase SQL Editor before enabling Share to X.
-- The API uses a server-only service key; no public database permissions are needed.

create table if not exists public.share_cards (
  id uuid primary key,
  image_url text not null,
  name text not null,
  title text not null,
  mode text not null check (mode in ('id', 'pfp', 'crew')),
  created_at timestamptz not null default now()
);

alter table public.share_cards enable row level security;

-- Create the storage bucket in the dashboard, or run this if it does not exist.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hhgoa-shares', 'hhgoa-shares', true, 3145728, array['image/jpeg'])
on conflict (id) do update
set public = true,
    file_size_limit = 3145728,
    allowed_mime_types = array['image/jpeg'];

-- Retention is intentional: original uploads never leave the browser. Only a 1200×630
-- social preview is stored when a visitor explicitly presses Share. Remove old previews
-- manually or schedule an expiry job if you want an automatic retention window.
