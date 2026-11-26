-- Replace the email below with the one owner email used in supabase-config.js.
create or replace function public.is_shop_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(
        auth.role() = 'authenticated'
        and lower(coalesce(auth.jwt() ->> 'email', '')) = lower('REPLACE_WITH_OWNER_EMAIL'),
        false
    );
$$;

revoke all on function public.is_shop_admin() from public;
grant execute on function public.is_shop_admin() to anon, authenticated;

create table if not exists public.products (
    id text primary key,
    name text not null check (char_length(name) between 1 and 80),
    category text not null check (char_length(category) <= 80),
    price numeric not null check (price > 0),
    image text not null default '',
    description text not null default '' check (char_length(description) <= 300),
    hidden boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    order_id text not null check (char_length(order_id) <= 40),
    order_date text not null default '',
    name text not null check (char_length(name) between 1 and 100),
    phone text not null check (char_length(phone) between 1 and 20),
    address text not null check (char_length(address) <= 500),
    pincode text not null default '' check (char_length(pincode) <= 10),
    order_type text not null default 'Home Delivery' check (char_length(order_type) <= 40),
    payment_method text not null default 'Cash on Delivery' check (char_length(payment_method) <= 60),
    items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 30),
    subtotal numeric not null check (subtotal >= 0),
    delivery_charge numeric not null check (delivery_charge >= 0),
    total numeric not null check (total > 0),
    status text not null default 'New' check (status in ('New', 'Contacted', 'Confirmed', 'Completed')),
    created_at timestamptz not null default now()
);

create table if not exists public.custom_cake_requests (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 1 and 100),
    phone text not null check (phone ~ '^[0-9]{10}$'),
    flavour text not null check (char_length(flavour) <= 80),
    size text not null check (char_length(size) <= 30),
    required_date date not null,
    message text not null default '' check (char_length(message) <= 500),
    payment_method text not null default 'Cash on Delivery' check (char_length(payment_method) <= 60),
    has_reference_photo boolean not null default false,
    has_customer_photo boolean not null default false,
    reference_photo_path text not null default '',
    customer_photo_path text not null default '',
    status text not null default 'New' check (status in ('New', 'Contacted', 'Confirmed', 'Completed')),
    created_at timestamptz not null default now()
);

create table if not exists public.website_content (
    id text primary key check (id = 'public'),
    banner_title text not null check (char_length(banner_title) <= 100),
    banner_description text not null check (char_length(banner_description) <= 300),
    shop_hours text not null default '' check (char_length(shop_hours) <= 120),
    shop_location text not null default '' check (char_length(shop_location) <= 120),
    shop_phone text not null default '' check (char_length(shop_phone) <= 15),
    alternate_phone text not null default '' check (char_length(alternate_phone) <= 15),
    featured_products text[] not null default '{}',
    review_url text not null default '' check (char_length(review_url) <= 500),
    catalogue_url text not null default '' check (char_length(catalogue_url) <= 1000),
    updated_at timestamptz not null default now()
);

insert into public.website_content (
    id, banner_title, banner_description, shop_location,
    shop_phone, alternate_phone, review_url, catalogue_url
)
values (
    'public',
    'Fresh Cakes For Every Moment',
    'Delicious freshly made cakes for birthdays, anniversaries and every special moment.',
    'Pasodra, Surat',
    '7874131575',
    '9723687308',
    'https://maps.app.goo.gl/myKn36fq3SijcxV27',
    'Cake%20Manual%201.pdf'
)
on conflict (id) do nothing;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.custom_cake_requests enable row level security;
alter table public.website_content enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
    on public.products for select to anon, authenticated using (true);
drop policy if exists "Owner can insert products" on public.products;
create policy "Owner can insert products"
    on public.products for insert to authenticated with check (public.is_shop_admin());
drop policy if exists "Owner can update products" on public.products;
create policy "Owner can update products"
    on public.products for update to authenticated
    using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists "Owner can delete products" on public.products;
create policy "Owner can delete products"
    on public.products for delete to authenticated using (public.is_shop_admin());

drop policy if exists "Owner can read orders" on public.orders;
create policy "Owner can read orders"
    on public.orders for select to authenticated using (public.is_shop_admin());
drop policy if exists "Public can submit new orders" on public.orders;
create policy "Public can submit new orders"
    on public.orders for insert to anon, authenticated with check (status = 'New');
drop policy if exists "Owner can update orders" on public.orders;
create policy "Owner can update orders"
    on public.orders for update to authenticated
    using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists "Owner can delete orders" on public.orders;
create policy "Owner can delete orders"
    on public.orders for delete to authenticated using (public.is_shop_admin());

drop policy if exists "Owner can read cake requests" on public.custom_cake_requests;
create policy "Owner can read cake requests"
    on public.custom_cake_requests for select to authenticated using (public.is_shop_admin());
drop policy if exists "Public can submit new cake requests" on public.custom_cake_requests;
create policy "Public can submit new cake requests"
    on public.custom_cake_requests for insert to anon, authenticated with check (status = 'New');
drop policy if exists "Owner can update cake requests" on public.custom_cake_requests;
create policy "Owner can update cake requests"
    on public.custom_cake_requests for update to authenticated
    using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists "Owner can delete cake requests" on public.custom_cake_requests;
create policy "Owner can delete cake requests"
    on public.custom_cake_requests for delete to authenticated using (public.is_shop_admin());

drop policy if exists "Public can read website content" on public.website_content;
create policy "Public can read website content"
    on public.website_content for select to anon, authenticated using (id = 'public');
drop policy if exists "Owner can insert website content" on public.website_content;
create policy "Owner can insert website content"
    on public.website_content for insert to authenticated with check (public.is_shop_admin());
drop policy if exists "Owner can update website content" on public.website_content;
create policy "Owner can update website content"
    on public.website_content for update to authenticated
    using (public.is_shop_admin()) with check (public.is_shop_admin());

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.orders, public.custom_cake_requests to authenticated;
grant insert on public.orders, public.custom_cake_requests to anon, authenticated;
grant update, delete on public.orders, public.custom_cake_requests to authenticated;
grant select on public.website_content to anon, authenticated;
grant insert, update on public.website_content to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
    ('shop-public', 'shop-public', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
    ('cake-requests', 'cake-requests', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view shop media" on storage.objects;
create policy "Public can view shop media"
    on storage.objects for select to anon, authenticated using (bucket_id = 'shop-public');
drop policy if exists "Owner can upload shop media" on storage.objects;
create policy "Owner can upload shop media"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'shop-public' and public.is_shop_admin());
drop policy if exists "Owner can update shop media" on storage.objects;
create policy "Owner can update shop media"
    on storage.objects for update to authenticated
    using (bucket_id = 'shop-public' and public.is_shop_admin())
    with check (bucket_id = 'shop-public' and public.is_shop_admin());
drop policy if exists "Owner can delete shop media" on storage.objects;
create policy "Owner can delete shop media"
    on storage.objects for delete to authenticated
    using (bucket_id = 'shop-public' and public.is_shop_admin());

drop policy if exists "Customers can upload cake request photos" on storage.objects;
create policy "Customers can upload cake request photos"
    on storage.objects for insert to anon, authenticated
    with check (
        bucket_id = 'cake-requests'
        and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/(reference|customer)\.(jpg|png|webp|gif)$'
    );
drop policy if exists "Owner can view cake request photos" on storage.objects;
create policy "Owner can view cake request photos"
    on storage.objects for select to authenticated
    using (bucket_id = 'cake-requests' and public.is_shop_admin());
drop policy if exists "Owner can delete cake request photos" on storage.objects;
create policy "Owner can delete cake request photos"
    on storage.objects for delete to authenticated
    using (bucket_id = 'cake-requests' and public.is_shop_admin());

do $$
declare
    target_table text;
begin
    foreach target_table in array array['products', 'orders', 'custom_cake_requests', 'website_content']
    loop
        if not exists (
            select 1
            from pg_publication_tables
            where pubname = 'supabase_realtime'
              and schemaname = 'public'
              and tablename = target_table
        ) then
            execute format('alter publication supabase_realtime add table public.%I', target_table);
        end if;
    end loop;
end;
$$;
