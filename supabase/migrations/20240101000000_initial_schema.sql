-- =============================================
-- O&N Clothing Brand Database Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- Categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  image_url text,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Products
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  sale_price numeric(10,2),
  category_id uuid references public.categories(id),
  is_new_arrival boolean default false,
  is_featured boolean default false,
  is_best_seller boolean default false,
  stock_quantity integer default 0,
  sku text unique,
  created_at timestamptz default now()
);

-- Product images
create table public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  image_url text not null,
  alt_text text,
  sort_order integer default 0
);

-- Product variants (sizes, colors)
create table public.product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  size text,
  color text,
  sku text unique,
  stock_quantity integer default 0,
  price numeric(10,2) not null,
  sale_price numeric(10,2)
);

-- Orders
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  status text default 'Order Placed' check (status in ('Order Placed', 'Payment Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')),
  payment_status text default 'Pending' check (payment_status in ('Pending', 'Paid', 'Failed', 'Refunded')),
  payment_method text,
  transaction_ref text,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) default 300,
  total numeric(10,2) not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_county text not null,
  delivery_town text not null,
  delivery_address text not null,
  delivery_instructions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order items
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  variant_id uuid references public.product_variants(id),
  product_name text not null,
  variant_label text,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  product_image_url text
);

-- Wishlists
create table public.wishlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

create table public.wishlist_items (
  id uuid default uuid_generate_v4() primary key,
  wishlist_id uuid references public.wishlists(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(wishlist_id, product_id)
);

-- Addresses
create table public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  phone text not null,
  county text not null,
  town text not null,
  address_line text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Site settings
create table public.site_settings (
  id text primary key default 'global',
  announcement_text text,
  hero_headline text,
  hero_subheadline text,
  hero_cta_text text,
  hero_cta_link text,
  featured_collection_id uuid references public.categories(id),
  promo_banner_text text,
  promo_banner_link text,
  updated_at timestamptz default now()
);

-- =============================================
-- RLS Policies
-- =============================================

-- Profiles
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins update all profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Categories (public read, admin write)
alter table public.categories enable row level security;
create policy "Categories viewable by all" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Products (public read, admin write)
alter table public.products enable row level security;
create policy "Products viewable by all" on public.products for select using (true);
create policy "Admins manage products" on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Product images (public read, admin write)
alter table public.product_images enable row level security;
create policy "Product images viewable by all" on public.product_images for select using (true);
create policy "Admins manage product images" on public.product_images for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Product variants (public read, admin write)
alter table public.product_variants enable row level security;
create policy "Product variants viewable by all" on public.product_variants for select using (true);
create policy "Admins manage product variants" on public.product_variants for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Orders (users view own, admins view all)
alter table public.orders enable row level security;
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Admins view all orders" on public.orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users create orders" on public.orders for insert with check (true);
create policy "Admins update orders" on public.orders for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Order items (same as orders)
alter table public.order_items enable row level security;
create policy "Users view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Admins view all order items" on public.order_items for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users create order items" on public.order_items for insert with check (true);
create policy "Admins update order items" on public.order_items for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Wishlists
alter table public.wishlists enable row level security;
create policy "Users manage own wishlist" on public.wishlists for all using (auth.uid() = user_id);

alter table public.wishlist_items enable row level security;
create policy "Users manage own wishlist items" on public.wishlist_items for all using (
  exists (select 1 from public.wishlists where id = wishlist_id and user_id = auth.uid())
);

-- Addresses
alter table public.addresses enable row level security;
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id);

-- Site settings (public read, admin write)
alter table public.site_settings enable row level security;
create policy "Site settings viewable by all" on public.site_settings for select using (true);
create policy "Admins manage site settings" on public.site_settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- =============================================
-- Functions
-- =============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update order updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.update_updated_at();

-- =============================================
-- Storage bucket
-- =============================================

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

create policy "Product images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
