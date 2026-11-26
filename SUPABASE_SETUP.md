# Free Supabase setup for the shop admin

The admin panel and public shop use Supabase for owner sign-in, product data, orders, custom cake requests, website content and photos. The project can use Supabase's Free plan; keep an eye on its quotas and project inactivity/pause rules.

## 1. Create a free Supabase project

1. Create a project at [Supabase](https://supabase.com/dashboard) and choose the Free plan.
2. Save the database password somewhere private. It is not used in the website.
3. In **Project Settings → API** (or **API Keys**), copy the **Project URL** and the **Publishable key** (the legacy `anon` key also works).
4. Put them and the one shop-owner email in `supabase-config.js`:

```js
export const supabaseUrl = "https://YOUR_PROJECT_ID.supabase.co";
export const supabaseAnonKey = "YOUR_PUBLISHABLE_OR_ANON_KEY";
export const adminEmail = "owner@example.com";
```

The publishable/anon key is intended for browser use. Never put a database password, secret key, or service-role key in this file.

## 2. Create the single owner login

1. In **Authentication → Users**, add the one owner user with a strong password and confirm the email.
2. In Authentication settings, disable public sign-ups. Do not create staff or customer auth users.
3. Use exactly the same owner email in `supabase-config.js` and in the SQL script below.

## 3. Create database tables and secure access

1. Open **SQL Editor → New query**.
2. In `supabase-setup.sql`, replace `REPLACE_WITH_OWNER_EMAIL` with the owner's email.
3. Paste and run the complete SQL script. It creates the shop tables, the private/public image buckets, row-level security policies and realtime subscriptions.

The database policies allow anyone to read the public catalogue and submit a new order/request. Only the single owner email can read customer records, change their statuses, edit products, update website content or read private cake-request photos. Confirm sign-ups are disabled in Auth; the SQL policies independently restrict owner actions to the configured email.

## 4. Publish and test

Publish the website over HTTPS, including `supabase-config.js`, `supabase-public.js`, `supabase-store.js`, `products-defaults.js`, `admin.html`, `admin.css`, `admin.js`, `supabase-setup.sql` and the site assets. Open `/admin.html`, sign in with the owner email/password, and use **Publish starter catalog** if the product list is empty.

Supabase Free currently includes quotas such as 500 MB database, 1 GB file storage, 50,000 monthly active users and 5 GB egress. Check [current pricing and plan limits](https://supabase.com/pricing). A free project may pause after inactivity; check Supabase's current free-plan policy and resume it if the shop's data stops loading.

Product photos and the replacement cake catalogue are uploaded to the public `shop-public` bucket. Customer reference photos are uploaded to the private `cake-requests` bucket and can only be opened by the configured owner.
