-- Это миграция базы. Применяется КОМАНДОЙ (не вручную): npm run db:push
-- Создаёт таблицу `entries` + защиту RLS: каждый видит ТОЛЬКО свои записи.
-- Новая таблица? npm run db:new -- имя → впиши SQL в новый файл → npm run db:push.

-- 1) Таблица записей
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

-- 2) Включаем Row Level Security (без этого таблица закрыта для всех)
alter table public.entries enable row level security;

-- 3) Правила доступа: каждый работает только со своими строками (user_id = текущий вход)
create policy "read own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "insert own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "delete own entries"
  on public.entries for delete
  using (auth.uid() = user_id);
