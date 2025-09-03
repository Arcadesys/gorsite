-- Creates the Link table for artist links pages
-- Run this against your Postgres (e.g., Supabase) database

create table if not exists "Link" (
  id text primary key,
  "portfolioId" text not null references "Portfolio"(id) on delete cascade,
  title text not null,
  url text not null,
  "imageUrl" text null,
  position integer null,
  "isPublic" boolean not null default true,
  "createdAt" timestamp with time zone not null default now(),
  "updatedAt" timestamp with time zone not null default now()
);

-- Simple trigger to keep updatedAt current
create or replace function set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_link_updated_at on "Link";
create trigger set_link_updated_at
before update on "Link"
for each row execute function set_updated_at();
