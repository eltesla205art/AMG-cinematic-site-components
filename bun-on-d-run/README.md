# Bun on D-Run

3D marketing site, pickup-ordering web app and owner dashboard for **Bun on D-Run**, a smash-burger joint at 2850 S Washington Ave, Titusville, FL. Built and managed by Ascension Media Group.

Vite + React + Tailwind CSS + @react-three/fiber / drei, with Supabase as the backend. Without Supabase configured it runs in **demo mode**, saving everything in the browser so the whole flow can be shown offline.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Routes

| Route | What it is |
|---|---|
| `/` | Marketing site: 3D hero burger, marquee, featured menu, 3D Burger Builder, Our Story, Find Us (map, hours, directions) |
| `/order` | Menu browser: category tabs, search, quantity steppers, add to cart |
| `/checkout` | Pickup form (name, phone, ASAP or 15-minute slots from store hours, notes). Pay at pickup |
| `/confirmation/:orderId` | Order number (BOD-1042, BOD-1043…), receipt, pickup estimate |
| `/track/:orderId` | Live status: Received → On the Grill → Ready for Pickup |
| `/admin` | Owner dashboard (demo logins below) |

Cart drawer and the mobile sticky cart bar are available site-wide.

## Connecting Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor**, paste in `supabase/schema.sql` and run it. Then do the same with `supabase/seed.sql` (the starting menu and store info). Both are safe to run again later.
3. Create the staff logins: **Authentication → Users → Add user**, one for Tim and one for yourself (email + password, tick "Auto confirm"). Then mark them as staff in the SQL Editor:
   ```sql
   insert into public.staff (user_id, name)
   select id, 'Tim (Owner)' from auth.users where email = 'tim@example.com';
   insert into public.staff (user_id, name)
   select id, 'Ascension Media Group' from auth.users where email = 'you@example.com';
   ```
   Only accounts in `public.staff` can open the dashboard. The name is what the activity log shows.
4. Under **Authentication → Sign In / Providers**, turn off "Allow new users to sign up", so nobody can create their own account.
5. Copy `.env.example` to `.env.local` and fill in the Project URL and the `anon` public key from **Project Settings → API**. Set the same two variables in your host (Netlify/Vercel) and redeploy.

The anon key is meant to be public. What protects the data is the row-level security in `schema.sql`:

- **Visitors** can read the menu and store info and place orders. They can't list or read anyone's orders, and they can't change prices: the database recomputes every price, the custom-burger price and the tax itself, ignoring what the browser sends.
- **Each order** gets a secret tracking link (`/track/BOD-1042?t=…`). Only someone with that link can see the order.
- **Staff** see and update everything in the dashboard. Status changes and activity-log entries are stamped with the signed-in staff member's name by the database.

If you change topping prices in `src/data/builder.js`, change them in `builder_quote()` in `schema.sql` too, and re-run it. To regenerate the seed after editing the default menu: `node scripts/seed-sql.mjs > supabase/seed.sql`.

## Owner dashboard

With Supabase, staff log in with the email and password from step 3. In demo mode the logins are **tim / demo123** (owner) and **manager / demo123** (web manager), and a banner reminds you that nothing is shared.

- **Orders**: live board, newest first, with a chime and NEW badge for orders that arrive while it's open (instantly via Supabase Realtime, with a 15-second re-check as a backstop). One-tap New → Preparing → Ready → Completed, plus Back. Status changes show up on the customer's tracking page.
- **Menu**: edit name, description, price, category and image; 86 or restore items (they disappear from `/order`, the home page and existing carts right away); add and delete items.
- **Hours & Info**: per-day hours (they drive the pickup slots and the "Open now" badge), phone, Facebook URL, address, and the announcement banner at the top of the site.
- **Stats**: today's order count, revenue and top item.
- **Activity**: who changed what, and when.

## How the pieces connect

Everything goes through `src/lib/backend/`: `supabase.js` when the two env vars are set, `local.js` (browser storage) otherwise. The cart always stays in the browser.

- Menu, store info, the orders board and the activity log update live from Supabase Realtime, and also refresh right after your own changes.
- The customer's tracking page re-checks its order every 5 seconds.
- In demo mode, keep `/admin` open in one tab and order in another, and changes sync between tabs. The tracking page also moves on its own for the demo (to "On the Grill" after 20 seconds, "Ready" after 75) until staff change the status.

## Before launch (search the code for `TODO`)

1. **Connect Supabase** (steps above). Until then the live site is a demo, and the owner can't see orders from customers' phones.
2. **Spam protection.** Anyone can call the order endpoint. For a launch-day burger joint that's usually fine; if fake orders show up, add Supabase's CAPTCHA (hCaptcha/Turnstile) to checkout.
3. **Payments.** Stripe or Square goes in `src/pages/Checkout.jsx` (marked).
4. **Business details from Tim.** Phone (`[PHONE]`), hours (default placeholder is 11am–9pm daily), Facebook page URL, menu items and prices. All of these, including the menu, can be edited in the dashboard. Also add `telephone`, `openingHoursSpecification` and `sameAs` to the JSON-LD in `index.html`.
5. **Copy check.** Menu descriptions such as "hand-cut" and "beer-battered" are placeholders. Confirm them with Tim before launch.
6. **Photos.** The Pexels images are stand-ins. Swap in real food photos when the place opens.
7. **Tax rate.** 7% (FL 6% + Brevard 1%) is an estimate in `src/data/business.js`.

## Notes

- The 3D scene (Three.js, ~220 kB gzipped) only loads when the canvas scrolls into view. Until then, or if WebGL is unavailable, a static SVG burger shows.
- `prefers-reduced-motion` stops the spin, float, drop animation and marquee.
- SPA fallback for hosting is included for Netlify (`public/_redirects`) and Vercel (`vercel.json`).
