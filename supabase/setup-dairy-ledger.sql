-- Run this once in Supabase Dashboard → SQL Editor.
-- It creates the single live ledger row used by this small business app.

create table if not exists public.dairy_ledger (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.dairy_ledger enable row level security;

drop policy if exists "dairy ledger read" on public.dairy_ledger;
create policy "dairy ledger read"
on public.dairy_ledger
for select
to anon, authenticated
using (id = 'main');

drop policy if exists "dairy ledger insert" on public.dairy_ledger;
create policy "dairy ledger insert"
on public.dairy_ledger
for insert
to anon, authenticated
with check (id = 'main');

drop policy if exists "dairy ledger update" on public.dairy_ledger;
create policy "dairy ledger update"
on public.dairy_ledger
for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');

grant select, insert, update on table public.dairy_ledger to anon, authenticated;

insert into public.dairy_ledger (id, value)
values (
  'main',
  '{"customers":[],"transactions":[],"purchases":[],"updatedAt":""}'::jsonb
)
on conflict (id) do nothing;
