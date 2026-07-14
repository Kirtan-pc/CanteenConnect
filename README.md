# CanteenConnect

> **🔴 Live Portfolio Demo** — Firebase Phone OTP is replaced with hardcoded demo credentials for easy public access. All other features (AI food detection, Razorpay payments, Firestore, Maps) are fully functional.

## 🚀 Demo Access

Try the app instantly — no real phone number needed:

| Role | Phone Number | Passcode | Dashboard |
|------|-------------|----------|-----------|
| 🍽️ Canteen / Donor | `9999999999` | `1234` | Donor Dashboard |
| 🌿 NGO / Processor | `8888888888` | `1234` | NGO Dashboard |

**Steps:** Get Started → Select your role → Enter phone → Enter passcode `1234` → Explore

---

## 1. The Detailed Problem
Urban India generates an enormous volume of organic waste daily, and institutional kitchens are among the biggest contributors. In Mumbai specifically, the BMC handles thousands of tonnes of wet waste every day, the majority of which ends up in landfills where it decomposes anaerobically and releases methane — a greenhouse gas 25× more potent than CO₂.

Field visits to VESIT's main canteen, hostel mess, and juice center revealed three specific gaps. First, vegetable waste (peels, scraps, unused ingredients) is generated consistently every single day during food preparation, but because there is no structured system to divert it, it gets mixed into municipal wet waste and collected by BMC trucks. Second, there is no NGO or composting organisation coordination at the institutional level — canteen staff have no way to alert a composting body, even if they wanted to. Third, at the community level, individuals and households regularly have leftover cooked food from events or daily cooking — food that is still safe to eat — but have no simple channel to donate it before it spoils.

On the other side of this gap, composting organisations actively need a consistent, reliable supply of organic waste to run their operations profitably. Compost is sold to farms, nurseries, and municipalities. Biogas plants need feedstock. Animal feed programs need organic scraps. These organisations exist and are profitable — they just have no efficient way to discover and collect from small institutional sources like college canteens. A digital platform that delivers a steady, location-aware pipeline of organic waste directly to their dashboard solves a real operational problem for them.

The core gap in all cases is the same: waste generators and waste processors exist, but there is no digital bridge connecting them in real time.

## 2. The Solution
CanteenConnect is a mobile-first Progressive Web App (PWA) that acts as that bridge. It is built as a React 19 + Vite SPA with PWA support, served over the local network via `vite --host` so that canteen staff can access it from any mobile browser on the same Wi-Fi — no app store installation needed.

The platform has two primary dashboards:
* **Donor Dashboard** — for canteen staff and individual food donors. They report organic waste or surplus cooked food in under 60 seconds.
* **NGO/Processor Dashboard** — for partner NGOs (food redistribution) and composting processors. They receive a live feed of nearby active requests, search for donors in any area, view requests on a map, and accept pickups.

The platform is free for canteens and donors. Composting organisations pay per pickup rather than a flat subscription — this is the key monetisation refinement made during development, described in detail in Section 4.

The key design insight — that cooked food and vegetable waste are two completely separate streams with different data requirements, different urgency, and different recipients — remains the core structural principle of the entire application.

## 3. Technology Stack (As Implemented)

### Frontend
* **Framework:** React 19 + Vite 8
* **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite`) with a custom `@theme` design system
* **Typography:** Inter (Google Fonts, weights 400–700)
* **Routing:** React Router DOM v7 with `AnimatePresence` page transitions
* **Animations:** Framer Motion v12 — all page transitions, card entrances, modal springs
* **Icons:** Lucide React
* **Charts:** Recharts — bar chart with per-bar Cell coloring
* **PDF:** jsPDF — landscape A4 certificate generation
* **Image:** browser-image-compression — client-side compression before AI upload
* **Auth State:** Custom AuthContext (React Context API) wrapping Firebase Auth
* **Maps:** Google Maps JavaScript API + Places Autocomplete
* **Payment UI:** Razorpay Checkout (CDN script in `index.html`)

### Backend
* **Runtime:** Node.js + Express 5
* **Database:** Firebase Firestore (via Firebase Admin SDK v13)
* **Auth Provider:** Firebase Auth (Admin SDK for server-side)
* **File Upload:** Multer v2 (multipart form parsing for AI image uploads)
* **AI Service:** Nyckel image classification API (OAuth 2.0 `client_credentials` flow)
* **Payment:** Razorpay Node SDK v2
* **Scheduling:** node-cron v4 (installed for food listing expiry)
* **Environment:** dotenv — all secrets kept server-side, never exposed to the frontend

### Firebase Services
* **Firebase Auth:** Phone OTP authentication with invisible reCAPTCHA
* **Firestore:** `users` collection (profiles + coordinates), `reports` collection (all waste/food reports)
* **Firebase Storage:** Imported and initialised (available for future direct image uploads)
* **Firebase Messaging:** Imported on the client (FCM infrastructure in place for future push notifications)
* **Firebase Admin SDK:** Backend reads/writes Firestore; updates report status on payment verification

## 4. How Each Feature Works (As Implemented)

### Authentication — Phone OTP
When a new user opens the app they land on `LandingPage`. They tap Get Started → `SelectRolePage` asks them to choose either Canteen / Donor or NGO / Processor. The selected role is saved to `localStorage`.
They are then taken to `AuthPage`. The auth flow uses Firebase Phone Authentication with an invisible reCAPTCHA. The user enters a 10-digit Indian mobile number (+91 prefix is prepended automatically). On submit, the backend calls `signInWithPhoneNumber` via Firebase, and a 6-digit OTP is sent to the phone.
The OTP entry UI is a row of 6 individual digit inputs — each input auto-focuses to the next box on entry, and auto-focuses back on backspace. This is a significant UX improvement over a single input field and is fully implemented.
On successful OTP verification, the user's geolocation is captured (with a 5-second timeout and a graceful fallback). User data — UID, phone number, role, organisation name, coordinates, and registration timestamp — is written to Firestore under `users/{uid}`. The user is then routed to the correct dashboard based on their role.

### Organic Waste Reporting — Canteen Flow
The canteen staff opens `ReportOrganicPage`. The form has:
* A free-text description textarea pre-labelled as "Materials"
* Quick-tap tags — six pre-defined buttons (Onion peels, Fruit scraps, Vegetable peels, Egg shells, Tea leaves, Coconut husk) that append to the description field without duplicates
* A kg stepper using + / − buttons (minimum 1 kg, starting at 5 kg), displaying the live value with the kg unit
* A Collection Slot time picker (defaults to 1 hour from the current time)

On submit, a POST is sent to `/api/reports/organic` with the description, weight, pickup time, source name (from `AuthContext`), source type (canteen), user UID, and coordinates. The backend persists this to Firestore with `status: 'pending'` and a `created_at` timestamp. A success screen confirms "Processing hubs have been synchronized" and redirects to the dashboard after 3 seconds.

### Cooked Food Donation — Donor Flow
The donor opens `ReportFoodPage`. The form has:
* Dish details — free text input (e.g., "Vegetable Pulao")
* Servings stepper (minimum 1, starting at 2)
* Prepared at time picker (defaults to current time)
* Quality Assurance — mandatory photo upload

The photo flow is built with client-side image compression via `browser-image-compression` (max 200 KB, max 800px). The compressed image is sent as multipart form data to `/api/nyckel/check-image`. While the backend calls Nyckel, the UI shows a blurred overlay over the photo with a spinning loader and the message "Analyzing Integrity."
The result is displayed as an animated overlay badge on the photo: a green "Verified Quality" badge (primary green) or a red "Integrity Issue" badge (danger red), both showing the confidence percentage. A summary card below the photo reiterates the system feedback in plain language.
A debug panel (accessible via a small bug icon) reveals the raw Nyckel API response — this was added during development to aid testing and model calibration.
The submit button is locked (`cursor-not-allowed`) unless `aiDecision.safe === true`. Submissions create a Firestore document with `type: 'food'`, `expires_at` set to 3 hours from creation, and the image stored as a base64 string in the payload (so the NGO can see it immediately without a separate storage lookup).

### AI Food Spoilage Detection — Nyckel Integration
The backend authenticates with Nyckel using an OAuth 2.0 `client_credentials` flow — it POSTs to `https://www.nyckel.com/connect/token` with `client_id` and `client_secret` to obtain a bearer token first, then calls the `invoke` endpoint. This means the API key is never sent from the frontend.
The image is sent as a FormData blob (not base64) to `POST https://www.nyckel.com/v1/functions/{FUNCTION_ID}/invoke`.
The decision logic is strict:
* Label FRESH → `safe: true`, donation allowed
* Label SPOILED at ≥70% confidence → `safe: false`, blocked with a specific high-confidence warning
* Label SPOILED at <70% confidence → `safe: false`, blocked with a low-confidence caution message (stricter than the original plan, which only blocked at ≥70%)
* Unknown or network failure → `safe: false`, user asked to retry with a clearer photo

Uploaded temp files are deleted from the `uploads/` directory immediately after the Nyckel call using `fs.unlinkSync`.

### Monetisation — Pay-Per-Pickup Model (Revised)
This is a significant improvement from the original subscription-based plan.
The original concept proposed a monthly/annual subscription fee that composting organisations would pay for platform access. The implemented model is pay-per-pickup at ₹10 per kg — composters pay for the organic waste they actually collect, not a flat access fee. This lowers the barrier to entry, makes the value immediately tangible to composters, and ties platform revenue directly to real usage volume.

The NGO Dashboard has a mode toggle at the top: **NGO Mode** vs **Processor**. When a composting processor (in Processor mode) taps "Accept" on an organic waste request, the flow is:
1. Backend creates a Razorpay order via `/api/payments/create-order`, calculating `amount = weight_kg × ₹10` (returned in paise)
2. The Razorpay Checkout modal opens client-side (loaded from the CDN in `index.html`) with the CanteenConnect name and emerald theme
3. On successful payment, the handler function calls `/api/payments/verify` — the backend verifies the HMAC signature using `crypto.createHmac` and updates the Firestore report to `status: 'accepted'`, `paymentStatus: 'paid'`, `paymentId`
4. The accepted request disappears from the live feed

For NGO mode (food redistribution), acceptance is free — a PATCH to `/api/reports/:id/accept` sets `status: 'accepted'` and `accepted_at` with no payment step.

### Geographic Partner Search (New Feature)
Both dashboards now include a location-based partner search — a major addition not present in the original plan.
* **Donor Dashboard:** A "Nearby Support Search" section with a Google Places Autocomplete input. When the donor selects a place, the app calls `/api/orgs/nearby?lat=&lng=&radius=15` and renders result cards showing each partner organisation's name, distance, phone number, and a direct phone call button.
* **NGO Dashboard:** A "Nearby Partner Search" with the same autocomplete, but calling `/api/donors/nearby?lat=&lng=&radius=15` to find nearby canteens and donors. Results are displayed identically.

Both use the Google Maps JavaScript API with the places library, loaded dynamically if not already present on the page. A clear (×) button resets the search state.

### Interactive Map — MapPage
The map is role-aware from the moment it loads:
* If `user.role === 'donor'`: fetches `/api/orgs/nearby` and plots NGO/composter markers
* If `user.role === 'ngo'` or similar: fetches `/api/reports/nearby` and plots active waste/food request markers

The map overlay contains three layers: a back button, a Google Places Autocomplete search bar, and a filter toggle.
Filter toggles are content-specific:
* **Donor view:** toggles between NGO and Composting Organisation — filters which org type is plotted
* **NGO/Processor view:** toggles between Food and Organic Waste — filters which report type is plotted

Tapping a marker opens a bottom sheet with a spring animation (`type: 'spring', damping: 25`). The sheet shows the name, role/type, available supply description (for food reports), and a phone row with two buttons: Copy (writes the number to clipboard) and Call (opens the native phone dialler via `tel:` link).
A floating action button (bottom-right) re-centers the map on the user's stored location. A live status pill in the top-right shows a pulsing amber dot while loading and a solid green dot when data is ready.

### Impact Tracker
`ImpactPage` fetches two endpoints in parallel:
* `/api/impact/:uid` — returns `kg_diverted`, `pickups_count`, and `co2_saved` (calculated as kg × 0.5)
* `/api/impact/historical/:uid` — returns 6 months of bar chart data (Oct–Mar)

The UI shows three stat cards (Kg Diverted, Collections, CO₂ Offset) and a Recharts `BarChart`. The most recent month's bar is rendered in the primary emerald colour; all previous months render in slate-400. This visually draws attention to recent activity.

The **Download Certificate** button generates a landscape A4 PDF using jsPDF. The certificate has a double-border frame in emerald green, the organisation name in large bold type, the month/year, kg diverted, and CO₂ prevented. The PDF filename includes the month and year (e.g., `CanteenConnect_Certificate_April_2026.pdf`). This is directly usable for NAAC reports and institutional CSR documentation.
The Impact tab is only shown to donor-role users in the bottom navigation. NGO/Processor accounts do not see it.

### In-App Calling
Every request card in the NGO Dashboard has a direct phone Call button. Every map marker bottom sheet has both a Copy and a Call button. All calls use `href="tel:{phone}"` — no VOIP, no permissions, works on any basic Android phone even on a weak connection. The number is taken from the Firestore user record.

### Bottom Navigation
`BottomNav` is a fixed bar at the bottom, centred and capped at 450px width to match the PWA container. It is role-aware:
* **Donor:** Home → Impact → Profile (3 tabs)
* **NGO:** Home → Profile (2 tabs — no Impact tab)

The active tab shows an emerald icon background and label. A `layoutId="nav-active"` Framer Motion dot animates between tabs with a spring transition.

### Profile Page
`ProfilePage` shows the user's organisation name, role label ("Authorized Donor" or "Partner Organization"), phone number from Firebase, and operational area. An inline edit mode allows updating the organisation name and representative name with an animated swap between view and edit states. Sign Out clears `localStorage` and navigates to the landing page.

## 5. Backend API Reference (As Implemented)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/ping` | Health check — returns `{ status: 'ok', database: 'firestore' }` |
| GET | `/api/reports/nearby` | Fetch pending reports within radius. Params: `lat`, `lng`, `radius` (default 10 km) |
| GET | `/api/orgs/nearby` | Fetch NGOs/composters within radius. Params: `lat`, `lng`, `radius` (default 15 km) |
| GET | `/api/donors/nearby` | Fetch donor accounts within radius. Params: `lat`, `lng`, `radius` (default 15 km) |
| POST | `/api/reports/organic` | Submit new organic waste report |
| POST | `/api/reports/food` | Submit new food donation (auto-sets `expires_at` +3 hours) |
| PATCH | `/api/reports/:id/accept` | Accept a food donation request (NGO, free) |
| POST | `/api/payments/create-order`| Create Razorpay order (₹10 × `weight_kg`) |
| POST | `/api/payments/verify` | Verify Razorpay HMAC signature, mark report as accepted + paid |
| GET | `/api/impact/:uid` | Return lifetime kg diverted, pickups count, CO₂ saved for a user |
| GET | `/api/impact/historical/:uid`| Return 6-month bar chart data |
| POST | `/api/nyckel/check-image` | Accept multipart image, call Nyckel AI, return safety decision |

Proximity filtering uses the Haversine formula implemented directly in `index.js` — no external geospatial library. All three proximity endpoints filter by straight-line distance in km.

## 6. Final Output for Both Parties

### Canteen / Donor gets:
* Confirmation that their report was received and is live
* A searchable map of nearby partner NGOs and composters with direct call access
* Geographic search to find partners in any area they specify
* Monthly impact stats (kg diverted, pickups, CO₂ saved) with a downloadable PDF certificate
* **Zero cost** — the platform is completely free for them

### NGO / Composting Processor gets:
* A live real-time feed that auto-refreshes every 30 seconds
* A mode toggle to switch instantly between NGO (free food acceptance) and Processor (paid organic waste acceptance) without re-logging in
* Full pickup details including AI-verified food photos for food items
* A map showing exactly where donors are with direct call + copy number
* Geographic search to find donors in any delivery area they're targeting
* Composting processors specifically get a consistent, location-aware supply pipeline where they pay only for what they actually pick up — ₹10/kg rather than a fixed monthly fee

### The developers get:
* Per-pickup revenue at ₹10/kg from every composting processor who accepts an organic waste pickup
* Revenue scales directly with pickup volume — as more canteens and composters join, revenue grows without additional infrastructure cost
* A Razorpay-verified payment trail for every transaction

## 7. Design System
The visual language is built on a custom `@theme` block in `index.css` using Tailwind CSS v4's new design token system. All values are CSS custom properties:

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--color-primary` | `#15803d` (emerald-700) | All interactive elements, icons, active states |
| `--color-accent` | `#f59e0b` (amber-500) | Food donation stream, warm actions |
| `--color-background`| `#f8fafc` (slate-50) | App background |
| `--color-surface` | `#ffffff` | Cards, modals, inputs |
| `--color-danger` | `#ef4444` | Errors, spoilage warnings |
| `--color-text-main` | `#0f172a` (slate-900) | Primary text |
| `--color-text-muted`| `#64748b` (slate-500) | Labels, metadata |
| `--color-border` | `#e2e8f0` (slate-200) | Card borders, dividers |
| `--font-sans` | Inter | All body and UI text |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)`| All transitions via `.transition-system` |
| `--shadow-subtle` | Shallow 1px/3px box shadow | Cards, inputs |

The entire app is constrained to a `max-w-[450px]` centered container — it renders as a phone-width app on desktop browsers and full-screen on mobile, matching the PWA mental model.
Skeleton loading states (`.skeleton` class → `bg-slate-200 animate-pulse rounded-md`) are used throughout — the NGO feed shows three placeholder cards while reports are loading.

## 8. Impact
* **Environmental** — Every kilogram of organic waste diverted from a landfill prevents methane generation. Across even 10 colleges in Mumbai, the platform could divert hundreds of kilograms of vegetable waste weekly. The ₹10/kg payment model creates a direct financial incentive for composters to make more pickups, increasing total diversion volume.
* **Social** — Cooked food that would otherwise be discarded reaches food-insecure communities through NGOs. The AI safety check gives donors confidence that they are not sending spoiled food. Donors receive submission confirmation and can track impact — this drives repeat donations.
* **Institutional** — Colleges get a measurable sustainability metric they can report to NAAC accreditation panels and CSR documentation. The downloadable jsPDF certificate makes this concrete, professional, and effortless — it is named, dated, and records specific kg and CO₂ figures.
* **Economic** — Composting organisations pay only for what they pick up — no upfront subscription commitment. This dramatically reduces their barrier to adopting the platform. Their sourcing cost per tonne of input material drops because they no longer spend staff hours identifying and coordinating with small institutional sources. The platform delivers sources to their dashboard automatically and handles the payment flow.
* **Civic** — The platform aligns with BMC's wet waste diversion targets and Swachh Bharat Mission goals around segregation and reuse. Institutional adoption at scale could be supported or endorsed by municipal bodies.

## 9. Future Scope
* **FCM Push Notifications** — Firebase Cloud Messaging is fully integrated on the client (`firebase/messaging` imported and initialised in `firebase.js`) and the FCM Server Key is configured in the backend `.env`. The notification dispatch logic is the next concrete implementation step.
* **Food listing auto-expiry via node-cron** — `node-cron` is installed in the backend. A scheduled job to query Firestore for food reports where `expires_at < now()` and update their status to expired.
* **WhatsApp Notifications** — Many smaller NGOs and composting operations don't maintain a smartphone app but are active on WhatsApp. Twilio's WhatsApp Business API can mirror FCM alerts as WhatsApp messages.
* **Route Optimisation for Composters** — Once 10+ canteens are active in a cluster, batch nearby pickups into a single optimised route suggestion.
* **Tiered Pricing for Composters** — The current ₹10/kg flat rate could evolve into a tiered model for high-volume composters.
* **Improved Nyckel Model** — The spoilage classifier gets more accurate over time as more Indian food photos are added to the training set.
* **Firebase Storage for Images** — Currently, food donation photos are stored as base64 strings in the Firestore document payload. Migrating to Storage URLs reduces Firestore document sizes.
* **Expansion beyond colleges** — Corporate cafeterias, wedding halls, hotel kitchens, and residential housing societies all generate consistent organic waste.
* **BMC Integration** — Formal reporting of diversion volumes to municipal waste tracking systems, contributing to city-level sustainability metrics.
