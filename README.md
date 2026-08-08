# Bookmarked by pri

A one-person bookclub site. You own the shelves and the verdicts; visitors browse and leave
notes on "the wall," which you approve before they appear. Owner mode is unlocked by an
email magic-link, not a toggle, so it is safe to put on the public internet.

Stack: Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · SQLite (swappable to Postgres)
· custom magic-link auth (jose + Resend).

---

## What runs where (the honest split)

- The **code, including real login,** is written and type-checked.
- **You** run *push* and *deploy* — they act on your GitHub and your host, which I can't reach.
- You supply **two secrets**: an email key (for the magic link) and, on a serverless host, a
  hosted database URL. There is a **dev fallback**: with no email key, the sign-in link is
  printed to your terminal, so it runs locally out of the box.
- Heads-up: the final `npm run build` is the first time the **Prisma engine** is fetched
  (my build sandbox blocked Prisma's engine CDN, so I verified types via `tsc` instead of a
  full build). On any normal machine/host, `npm install` downloads the engine and it builds.

---

## 1. Run it locally

```bash
npm install
cp .env.example .env      # then open .env and fill in the values below
npm run setup             # creates the SQLite db + seeds 6 books & 2 quotes
npm run dev               # http://localhost:3000
```

Minimum `.env` to run locally:

```
AUTH_SECRET="any-long-random-string"   # openssl rand -base64 32
OWNER_EMAIL="you@example.com"          # the ONLY email that can be owner
APP_URL="http://localhost:3000"
DATABASE_URL="file:./dev.db"
RESEND_API_KEY=""                      # leave blank locally
EMAIL_FROM="Bookmarked <onboarding@resend.dev>"
```

**Signing in locally:** go to `/login`, enter your `OWNER_EMAIL`. With `RESEND_API_KEY`
blank, the magic link is printed in the terminal running `npm run dev` — click it. Any other
email is silently ignored. Sign out with the "owner mode: on" button.

---

## 2. Push to GitHub

```bash
git init
git add -A
git commit -m "Bookmarked by pri"
# make an empty repo on github.com first, then:
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

`.env`, `node_modules`, `.next`, and the local `*.db` are git-ignored, so no secrets ship.

---

## 3. Get an email key (for the live magic link)

1. Sign up free at https://resend.com and create an API key.
2. Simplest start: keep `EMAIL_FROM="Bookmarked <onboarding@resend.dev>"`. Because you are the
   only recipient (your `OWNER_EMAIL`), this is enough. To send from your own domain later,
   verify it in Resend and change `EMAIL_FROM`.
3. You'll paste `RESEND_API_KEY` into your host's env vars in step 4.

---

## 4. Deploy (Netlify)

Netlify runs the app through its official Next.js runtime (already declared in `netlify.toml`).
Netlify Functions have an ephemeral disk, so the database is a hosted **Postgres** — the repo is
already set to Postgres and ships the correct Prisma engine for Netlify's Lambda runtime, so
there's nothing to change.

1. **Database:** create a free Postgres at https://neon.tech and copy the connection string.
2. **One-time schema + seed** (run once from your machine against Neon):
   ```bash
   DATABASE_URL="<neon-url>" npm run setup
   ```
3. **Connect the repo:** on https://app.netlify.com → Add new site → Import from GitHub → pick
   this repo. Build command `npm run build` is picked up from `netlify.toml`.
4. **Environment variables** (Site settings → Environment variables):
   ```
   AUTH_SECRET      any long random string   (openssl rand -base64 32)
   OWNER_EMAIL      the email you'll sign in with
   APP_URL          https://<your-site>.netlify.app     (no trailing slash)
   DATABASE_URL     your Neon connection string
   RESEND_API_KEY   from resend.com
   EMAIL_FROM       Bookmarked <onboarding@resend.dev>
   ```
5. **Deploy.** Then open `https://<your-site>.netlify.app/login`, enter `OWNER_EMAIL`, click the
   emailed link. After the first deploy, make sure `APP_URL` is set to the final URL (and a custom
   domain later, if you add one) so magic-link emails point to the right place.

### Local development note
The schema is Postgres now, so the simplest local setup is to reuse the same Neon `DATABASE_URL`
in your `.env`. If you'd rather use a local file, temporarily set `provider = "sqlite"` in
`prisma/schema.prisma` and `DATABASE_URL="file:./dev.db"`, then `npm run setup`.

## Everyday use

- **/** — the shelves, "lines I underlined," espresso stats, and the wall.
- Owner (signed in): add/edit/remove books, drag a jacket to another shelf, add/remove quotes,
  approve or reject pending notes.
- Visitors: browse, react on a book's page, leave a note (held for your approval).
- **/books/<slug>** — one book, its verdict, reactions, and marked lines.

## Where things are
- `prisma/schema.prisma` — data model · `prisma/seed.ts` — starter books
- `src/lib/auth.ts` — magic-link tokens & owner check · `src/lib/email.ts` — Resend + dev fallback
- `src/app/actions.ts` — all mutations (owner-gated) · `src/app/page.tsx` — home
- `src/components/*` — shelves (drag), add-book search, guestbook, reactions
- Owner photo: `public/pri.jpg` (swap this file to change it)
