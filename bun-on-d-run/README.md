# Bun on D-Run

3D marketing site, pickup-ordering web app and owner dashboard for **Bun on D-Run**, a smash-burger joint at 2850 S Washington Ave, Titusville, FL. Built and managed by Ascension Media Group.

Vite + React + Tailwind CSS + @react-three/fiber / drei. No backend yet: everything persists to `localStorage` so the whole flow can be demoed end to end.

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

## Owner dashboard

Demo logins: **tim / demo123** (owner) and **manager / demo123** (web manager). Both are recorded by name in the activity log.

- **Orders**: live board, newest first, with a chime and NEW badge for orders that arrive while it's open. One-tap New → Preparing → Ready → Completed, plus Back. Status changes show up on the customer's tracking page.
- **Menu**: edit name, description, price, category and image; 86 or restore items (they disappear from `/order`, the home page and existing carts right away); add and delete items.
- **Hours & Info**: per-day hours (they drive the pickup slots and the "Open now" badge), phone, Facebook URL, address, and the announcement banner at the top of the site.
- **Stats**: today's order count, revenue and top item.
- **Activity**: who changed what, and when.

## How the pieces connect

All shared state goes through `src/lib/storage.js` (keys `bod.cart`, `bod.orders`, `bod.menu`, `bod.info`, `bod.activity`). Changes sync live across components and browser tabs, so you can keep `/admin` open in one tab and place orders in another.

Tracking-page demo: an order moves to "On the Grill" after 20 seconds and to "Ready" after 75 seconds, until staff change its status in the dashboard. From then on, only staff move it.

## Before launch (search the code for `TODO`)

1. **Auth (required).** The demo passwords ship in the JavaScript bundle, so anyone can read them. Replace `src/pages/admin/auth.js` with Supabase Auth (or Firebase Auth) and add row-level security.
2. **Backend.** Swap `src/lib/storage.js` for Supabase/Firebase tables and realtime subscriptions. As it stands, orders only exist in the customer's own browser, so the owner can't see orders from other people's phones.
3. **Payments.** Stripe or Square goes in `src/pages/Checkout.jsx` (marked).
4. **Business details from Tim.** Phone (`[PHONE]`), hours (default placeholder is 11am–9pm daily), Facebook page URL, menu items and prices. All except the menu text can be edited in the dashboard. Also add `telephone`, `openingHoursSpecification` and `sameAs` to the JSON-LD in `index.html`.
5. **Copy check.** Menu descriptions such as "hand-cut" and "beer-battered" are placeholders. Confirm them with Tim before launch.
6. **Photos.** The Pexels images are stand-ins. Swap in real food photos when the place opens.
7. **Tax rate.** 7% (FL 6% + Brevard 1%) is an estimate in `src/data/business.js`.

## Notes

- The 3D scene (Three.js, ~220 kB gzipped) only loads when the canvas scrolls into view. Until then, or if WebGL is unavailable, a static SVG burger shows.
- `prefers-reduced-motion` stops the spin, float, drop animation and marquee.
- SPA fallback for hosting is included for Netlify (`public/_redirects`) and Vercel (`vercel.json`).
