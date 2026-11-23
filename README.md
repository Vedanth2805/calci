# CalciShare 🧮

A peer-to-peer web application where Vidyavardhaka College of Engineering (**VVCE**, Mysuru) students lend or sell scientific calculators (e.g., Casio fx-991CW, fx-991EX, fx-82MS) directly to each other on campus.

---

## 🛠️ Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Backend & Auth**: Supabase (PostgreSQL, Auth with Google OAuth, Row Level Security)
- **SSR & Session**: `@supabase/ssr` (Server client, Browser client, Next.js Proxy/Middleware)
- **Hosting & CI**: Vercel Free Tier (Custom Domain) + GitHub Actions (Keep-Alive Cron)

---

## 📁 Project Structure

```text
calcishare/
├── .github/
│   └── workflows/
│       └── keepalive.yml        # Daily cron & manual GitHub Action to prevent Supabase free-tier pause
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts         # OAuth code exchange, domain validation & internal redirect guard
│   ├── board/
│   │   └── page.tsx             # Protected calculator exchange feed with filters & reporting
│   ├── my-listings/
│   │   └── page.tsx             # Protected listing management (mark done, renew 30d, delete)
│   ├── post/
│   │   └── page.tsx             # Protected new calculator listing form (5 active listing cap)
│   ├── privacy/
│   │   └── page.tsx             # Public plain-language privacy policy for Google OAuth verification
│   ├── error.tsx                # Friendly error boundary
│   ├── favicon.ico              # App favicon
│   ├── globals.css              # Global styling & Tailwind v4
│   ├── layout.tsx               # Root layout, Open Graph & Twitter metadata
│   ├── not-found.tsx            # Custom 404 page
│   └── page.tsx                 # Public landing page with VVCE Google sign-in & Google-review info
├── components/
│   ├── BoardView.tsx            # Interactive feed, filter pills, report modal, sanitized links
│   ├── Footer.tsx               # Universal footer with VVCE notice, /privacy link & contact email
│   ├── GoogleSignInButton.tsx   # Google OAuth trigger with hd=vvce.ac.in prompt
│   ├── Header.tsx               # Responsive navigation bar with active links & user badge
│   ├── icons.tsx                # Instagram and Discord SVG icons
│   ├── MyListingsView.tsx       # User's listings management, status badges & delete confirmation
│   ├── PostListingForm.tsx      # Form with handle validation, model selection & character limits
│   └── SignOutButton.tsx        # Client-side sign out handler
├── supabase/
│   ├── schema.sql               # Step 1: Base schema, profiles parser, spam wall & RLS
│   ├── migration_002.sql        # Step 2: 5-available-listing INSERT limit trigger
│   ├── migration_003.sql        # Step 3: Column immutability, UPDATE guard & 31d cap
│   └── migration_004.sql        # Step 4: Keep-alive RPC function with anon/authenticated permissions
├── utils/
│   ├── listings.ts              # Model list, relative time formatting, status helpers, copy util
│   └── supabase/
│       ├── client.ts            # Supabase browser client (createBrowserClient)
│       ├── middleware.ts        # Session refresh & protected route gatekeeper
│       └── server.ts            # Supabase server client (createServerClient with cookies)
├── next.config.ts               # Security headers (X-Frame-Options, nosniff, etc.) & Turbopack config
├── proxy.ts                     # Next.js 16 proxy/middleware entry point
├── .env.example                 # Environment variables template
├── package.json
└── README.md
```

---

## 🚀 Local Run Steps

### 1. Prerequisites
- Node.js 18+ or 20+ (Node v20 or v22 recommended)
- A free [Supabase](https://supabase.com) account

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/calcishare.git
cd calcishare
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Security Note**: Never expose or use the Supabase `service_role` secret in frontend code. Only the public anon key is used.

### 4. Database Setup & Migration Order
Open the **SQL Editor** in your Supabase Dashboard and run the following migration scripts in exact order:

1. `supabase/schema.sql`: Sets up `profiles`, `listings`, `reports` tables, indexes, domain check trigger, and initial RLS policies.
2. `supabase/migration_002.sql`: Adds the trigger function enforcing a maximum of 5 active/available listings per user on INSERT.
3. `supabase/migration_003.sql`: Hardens updates (blocks changes to `owner_id`, `report_count`, `created_at`, prevents `done` -> `available` reversal, caps renewals at 31 days, and adds format constraints).
4. `supabase/migration_004.sql`: Creates the `public.keepalive()` RPC function and grants execution to `anon` and `authenticated` roles for GitHub Actions keep-alive.

### 5. Start the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment on Vercel

1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and import your `calcishare` repository.
3. Add the following Environment Variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
4. Deploy the project.
5. In Vercel **Project Settings > Domains**, add your custom domain: `YOUR_DOMAIN`.
6. Configure the DNS CNAME and A records at your domain registrar as instructed by Vercel.

---

## ⏰ Free-Tier Keep-Alive GitHub Action

Supabase automatically pauses free-tier projects after 7 days of inactivity. CalciShare includes a lightweight keep-alive automation in `.github/workflows/keepalive.yml`:

- **Schedule**: Runs automatically every day at 05:30 UTC (11:00 AM IST) via GitHub Actions cron, and can be triggered manually via `workflow_dispatch`.
- **How it works**: Sends an authenticated HTTP GET request to `https://your-project-id.supabase.co/rest/v1/rpc/keepalive` with `apikey` and `Authorization: Bearer <ANON_KEY>`.
- **Privacy & Safety**: The `public.keepalive()` database function executes a trivial count query (`SELECT count(*) FROM public.listings WHERE status = 'available'`) without returning or exposing any personal data or row contents.
- **Setup in GitHub**:
  1. Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions**.
  2. Add repository secrets:
     - `SUPABASE_URL`: `https://your-project-id.supabase.co`
     - `SUPABASE_ANON_KEY`: `your-supabase-anon-key`
  3. Go to the **Actions** tab, select **Supabase Free-Tier Keep-Alive**, and click **Run workflow** to test.

---

## 🔒 Google OAuth Publishing Requirements

When publishing the Google OAuth app for production:

1. **Google Auth Platform > Branding**:
   - Application Name: `CalciShare`
   - User Support Email: your student email
   - Application Home Page: `https://YOUR_DOMAIN/`
   - Privacy Policy URL: `https://YOUR_DOMAIN/privacy`
   - Authorised Domain: `YOUR_DOMAIN`
2. **Google Search Console**:
   - Verify ownership of `YOUR_DOMAIN` via DNS TXT record.
3. **Google Auth Platform > Audience**:
   - Set publishing status from *Testing* to *Production (Publish app)*.
4. **Supabase Auth > URL Configuration**:
   - Site URL: `https://YOUR_DOMAIN`
   - Redirect URLs: `https://YOUR_DOMAIN/**` (and keep `http://localhost:3000/**` for local dev).

---

## 🛡️ Security Architecture

1. **Database Spam Wall (`check_user_email_domain`)**:
   PostgreSQL trigger rejects any signup where email is not ending with `@vvce.ac.in`.
2. **Profile Parsing (`handle_new_user_profile`)**:
   Extracts branch and year (e.g., `vvce24cse463@vvce.ac.in` -> CSE '24).
3. **Row Level Security (RLS)**:
   - Deny by default on all tables.
   - Non-logged-in visitors cannot read listings, handles, or profiles.
   - Listings with `report_count >= 3` are automatically hidden from other users.
   - Users can only edit, renew, or delete their own listings.
4. **Input Sanitization & Open Redirect Defense**:
   - Strict regex for contact handles (`^[a-zA-Z0-9._-]+$`).
   - Instagram URLs are sanitized and use `target="_blank"` with `rel="noopener noreferrer"`.
   - `/auth/callback` verifies that redirects are strictly internal paths.
5. **Security Headers**:
   `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
