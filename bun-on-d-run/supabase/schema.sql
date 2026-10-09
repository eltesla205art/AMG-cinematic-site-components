-- Bun on D-Run: Supabase schema
-- Run once in the Supabase dashboard (SQL Editor), then run seed.sql.
-- Safe to re-run: tables and policies are created if missing, functions replaced.
--
-- Security model
--   * Anyone (anon key): read the menu and store info, place an order through
--     place_order(), and read back their own order with get_order() using the
--     secret tracking token they got at checkout. They can never list orders.
--   * Staff (rows in public.staff, signed in with Supabase Auth): everything in
--     the owner dashboard. Prices and totals are always computed here, in the
--     database, never trusted from the browser.

-- ---------------------------------------------------------------- staff
create table if not exists public.staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text not null check (length(name) between 1 and 60),
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid())
$$;

create or replace function public.staff_name()
returns text
language sql stable security definer set search_path = public
as $$
  select name from public.staff where user_id = auth.uid()
$$;

-- ---------------------------------------------------------------- menu
create table if not exists public.menu_items (
  id          text primary key check (id ~ '^[a-z0-9-]{1,80}$'),
  category    text not null check (category in ('burgers', 'sides', 'shakes', 'combos')),
  name        text not null check (length(name) between 1 and 80),
  description text not null default '' check (length(description) <= 300),
  price       numeric(8, 2) not null check (price >= 0 and price < 1000),
  image       text not null default '' check (image = '' or image ~ '^https://'),
  available   boolean not null default true,
  featured    boolean not null default false,
  custom      boolean not null default false, -- the 3D Burger Builder item
  sort        int not null default 1000,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- store info
-- One row (id = 1) holding hours, phone, address, banner and tax rate as JSON,
-- in the same shape as DEFAULT_INFO in src/data/business.js.
create table if not exists public.store_info (
  id         smallint primary key default 1 check (id = 1),
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- orders
create sequence if not exists public.order_number_seq start 1042;

create table if not exists public.orders (
  id          text primary key,                       -- BOD-1042
  track_token uuid not null default gen_random_uuid(), -- customer's secret for get_order()
  created_at  timestamptz not null default now(),
  customer    jsonb not null,                         -- { name, phone, notes }
  pickup      jsonb not null,                         -- { asap, at (epoch ms) }
  lines       jsonb not null,                         -- [{ key, itemId, name, price, qty, options }]
  totals      jsonb not null,                         -- { subtotal, tax, total }
  payment     text not null default 'pay-at-pickup',
  status      text not null default 'new' check (status in ('new', 'preparing', 'ready', 'completed')),
  history     jsonb not null default '[]'             -- [{ status, at (epoch ms), by }]
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------- activity log
create table if not exists public.activity_log (
  id        uuid primary key default gen_random_uuid(),
  at        timestamptz not null default now(),
  user_id   uuid references auth.users (id) on delete set null,
  user_name text not null default '',
  action    text not null check (length(action) between 1 and 500)
);
create index if not exists activity_log_at_idx on public.activity_log (at desc);

-- Who did it comes from the signed-in account, not from the browser.
create or replace function public.activity_log_stamp()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  new.user_id := auth.uid();
  new.user_name := coalesce(public.staff_name(), 'unknown');
  new.at := now();
  return new;
end
$$;

drop trigger if exists activity_log_stamp on public.activity_log;
create trigger activity_log_stamp before insert on public.activity_log
  for each row execute function public.activity_log_stamp();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists menu_items_touch on public.menu_items;
create trigger menu_items_touch before update on public.menu_items
  for each row execute function public.touch_updated_at();
drop trigger if exists store_info_touch on public.store_info;
create trigger store_info_touch before update on public.store_info
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- row-level security
alter table public.staff        enable row level security;
alter table public.menu_items   enable row level security;
alter table public.store_info   enable row level security;
alter table public.orders       enable row level security;
alter table public.activity_log enable row level security;

do $$
begin
  -- staff: you can see your own row; staff can see the whole team
  if not exists (select 1 from pg_policies where tablename = 'staff' and policyname = 'staff read') then
    create policy "staff read" on public.staff for select to authenticated
      using (user_id = auth.uid() or public.is_staff());
  end if;

  -- menu: public read, staff write
  if not exists (select 1 from pg_policies where tablename = 'menu_items' and policyname = 'menu public read') then
    create policy "menu public read" on public.menu_items for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'menu_items' and policyname = 'menu staff insert') then
    create policy "menu staff insert" on public.menu_items for insert to authenticated with check (public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'menu_items' and policyname = 'menu staff update') then
    create policy "menu staff update" on public.menu_items for update to authenticated
      using (public.is_staff()) with check (public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'menu_items' and policyname = 'menu staff delete') then
    create policy "menu staff delete" on public.menu_items for delete to authenticated using (public.is_staff());
  end if;

  -- store info: public read, staff update
  if not exists (select 1 from pg_policies where tablename = 'store_info' and policyname = 'info public read') then
    create policy "info public read" on public.store_info for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'store_info' and policyname = 'info staff update') then
    create policy "info staff update" on public.store_info for update to authenticated
      using (public.is_staff()) with check (public.is_staff());
  end if;

  -- orders: staff read only. Customers go through place_order()/get_order();
  -- status changes go through set_order_status().
  if not exists (select 1 from pg_policies where tablename = 'orders' and policyname = 'orders staff read') then
    create policy "orders staff read" on public.orders for select to authenticated using (public.is_staff());
  end if;

  -- activity log: staff read and append
  if not exists (select 1 from pg_policies where tablename = 'activity_log' and policyname = 'activity staff read') then
    create policy "activity staff read" on public.activity_log for select to authenticated using (public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'activity_log' and policyname = 'activity staff insert') then
    create policy "activity staff insert" on public.activity_log for insert to authenticated with check (public.is_staff());
  end if;
end
$$;

-- Table privileges, spelled out so the app doesn't depend on project defaults.
-- RLS policies above still decide which rows each role can touch.
grant usage on schema public to anon, authenticated;
grant select on public.menu_items, public.store_info to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant update on public.store_info to authenticated;
grant select on public.orders, public.staff to authenticated;
grant select, insert on public.activity_log to authenticated;
-- Supabase may grant more by default; take back what neither role should have.
revoke all on public.orders, public.activity_log, public.staff from anon;
revoke insert, update, delete on public.orders, public.staff from authenticated;
revoke all on sequence public.order_number_seq from anon, authenticated;

-- ---------------------------------------------------------------- 3D Burger Builder pricing
-- Must match INGREDIENTS in src/data/builder.js. The base price is the
-- 'build-your-own' menu item's price, which the owner can change.
create or replace function public.builder_quote(p_base numeric, p_sel jsonb)
returns table (price numeric, options jsonb)
language plpgsql immutable set search_path = public
as $$
declare
  v_patty int := coalesce((p_sel ->> 'patty')::int, 0);
  v_price numeric := p_base;
  v_opts  text[] := '{}';
  r record;
begin
  if jsonb_typeof(coalesce(p_sel, '{}'::jsonb)) <> 'object' then
    raise exception 'Invalid burger selection' using errcode = '22023';
  end if;
  if v_patty not between 0 and 2 then
    raise exception 'Invalid patty count' using errcode = '22023';
  end if;
  v_price := v_price + v_patty * 2.50;
  if v_patty = 1 then v_opts := v_opts || 'Double patty'::text;
  elsif v_patty = 2 then v_opts := v_opts || 'Triple patty'::text;
  end if;

  for r in
    select * from (values
      (1, 'cheese',    'American Cheese', 0.75),
      (2, 'bacon',     'Bacon',           1.75),
      (3, 'lettuce',   'Lettuce',         0.00),
      (4, 'tomato',    'Tomato',          0.00),
      (5, 'onion',     'Onion',           0.00),
      (6, 'pickles',   'Pickles',         0.00),
      (7, 'jalapenos', 'Jalapeños',       0.50),
      (8, 'ketchup',   'Ketchup',         0.00),
      (9, 'mustard',   'Mustard',         0.00),
      (10, 'drun',     'D-Run Sauce',     0.50)
    ) as t(ord, id, label, cost)
    order by ord
  loop
    if coalesce((p_sel ->> r.id)::boolean, false) then
      v_price := v_price + r.cost;
      v_opts := v_opts || r.label::text;
    end if;
  end loop;

  if cardinality(v_opts) = 0 then v_opts := array['Plain single']; end if;
  return query select round(v_price, 2), to_jsonb(v_opts);
end
$$;

-- ---------------------------------------------------------------- customer RPCs
create or replace function public.place_order(p_customer jsonb, p_pickup jsonb, p_lines jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_name   text := btrim(coalesce(p_customer ->> 'name', ''));
  v_phone  text := btrim(coalesce(p_customer ->> 'phone', ''));
  v_notes  text := btrim(coalesce(p_customer ->> 'notes', ''));
  v_asap   boolean := coalesce((p_pickup ->> 'asap')::boolean, false);
  v_at     timestamptz;
  v_now_ms bigint := floor(extract(epoch from now()) * 1000);
  v_line   jsonb;
  v_idx    int := 0;
  v_item   public.menu_items;
  v_qty    int;
  v_price  numeric;
  v_opts   jsonb;
  v_name_out text;
  v_lines  jsonb := '[]';
  v_sub    numeric := 0;
  v_rate   numeric;
  v_tax    numeric;
  v_id     text;
  v_token  uuid;
begin
  if length(v_name) not between 1 and 60 then
    raise exception 'Please enter your name.' using errcode = '22023';
  end if;
  if regexp_replace(v_phone, '\D', '', 'g') !~ '^1?\d{10}$' then
    raise exception 'Please enter a 10-digit phone number.' using errcode = '22023';
  end if;
  if length(v_notes) > 300 then
    raise exception 'Order notes are too long.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) not between 1 and 30 then
    raise exception 'Your cart is empty or too large.' using errcode = '22023';
  end if;

  if v_asap then
    v_at := now() + interval '15 minutes';
  else
    v_at := to_timestamp((p_pickup ->> 'at')::bigint / 1000.0);
    if v_at is null or v_at < now() - interval '5 minutes' or v_at > now() + interval '8 days' then
      raise exception 'That pickup time is no longer available.' using errcode = '22023';
    end if;
  end if;

  for v_line in select value from jsonb_array_elements(p_lines) loop
    v_idx := v_idx + 1;
    v_qty := (v_line ->> 'qty')::int;
    if v_qty is null or v_qty not between 1 and 50 then
      raise exception 'Invalid quantity.' using errcode = '22023';
    end if;

    select * into v_item from public.menu_items where id = v_line ->> 'itemId';
    if not found or not v_item.available then
      raise exception 'UNAVAILABLE:%', coalesce(v_item.name, v_line ->> 'itemId') using errcode = 'P0001';
    end if;

    if v_item.custom then
      select q.price, q.options into v_price, v_opts
        from public.builder_quote(v_item.price, v_line -> 'selection') q;
      v_name_out := 'Custom Smash';
    else
      v_price := v_item.price;
      v_opts := null;
      v_name_out := v_item.name;
    end if;

    v_lines := v_lines || jsonb_build_object(
      'key', v_idx::text, 'itemId', v_item.id, 'name', v_name_out,
      'price', v_price, 'qty', v_qty, 'options', v_opts);
    v_sub := v_sub + v_price * v_qty;
  end loop;

  select coalesce((data ->> 'taxRate')::numeric, 0.07) into v_rate from public.store_info where id = 1;
  v_rate := coalesce(v_rate, 0.07);
  v_sub := round(v_sub, 2);
  v_tax := round(v_sub * v_rate, 2);

  v_id := 'BOD-' || nextval('public.order_number_seq');
  insert into public.orders (id, customer, pickup, lines, totals, history)
  values (
    v_id,
    jsonb_build_object('name', v_name, 'phone', v_phone, 'notes', v_notes),
    jsonb_build_object('asap', v_asap, 'at', floor(extract(epoch from v_at) * 1000)),
    v_lines,
    jsonb_build_object('subtotal', v_sub, 'tax', v_tax, 'total', v_sub + v_tax),
    jsonb_build_array(jsonb_build_object('status', 'new', 'at', v_now_ms, 'by', 'customer'))
  )
  returning track_token into v_token;

  return jsonb_build_object('id', v_id, 'token', v_token);
end
$$;

create or replace function public.get_order(p_id text, p_token uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select to_jsonb(o) - 'track_token'
  from public.orders o
  where o.id = p_id and o.track_token = p_token
$$;

-- ---------------------------------------------------------------- staff RPCs
create or replace function public.set_order_status(p_id text, p_status text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if p_status not in ('new', 'preparing', 'ready', 'completed') then
    raise exception 'Invalid status' using errcode = '22023';
  end if;
  update public.orders
     set status = p_status,
         history = history || jsonb_build_array(jsonb_build_object(
           'status', p_status, 'at', floor(extract(epoch from now()) * 1000), 'by', public.staff_name()))
   where id = p_id;
  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;
end
$$;

-- Functions are executable by PUBLIC by default; grant only what each role needs.
revoke all on function public.set_order_status(text, text) from public, anon;
revoke all on function public.activity_log_stamp() from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_order(text, uuid) to anon, authenticated;
grant execute on function public.set_order_status(text, text) to authenticated;

-- ---------------------------------------------------------------- realtime
-- Live updates for the dashboard (orders, activity) and the public site (menu, info).
-- Realtime respects the RLS policies above.
do $$
declare t text;
begin
  foreach t in array array['orders', 'menu_items', 'store_info', 'activity_log'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end
$$;
