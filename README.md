# RenewCred CMS

A production-shaped headless CMS: an authenticated admin panel for managing block-based
page content, and a public Next.js site that renders that content dynamically — nothing
on the public site is hardcoded.

```
renewcred-cms/
├── backend/            Express + PostgreSQL/Prisma REST API
├── admin-frontend/      Next.js 14 + Redux Toolkit — the CMS
├── public-frontend/      Next.js 14 — the public site
└── docker-compose.yml   One command, full stack
```

## Quick start (Docker)

```bash
cp backend/.env.example backend/.env      # edit JWT secrets before real deployment
docker compose up --build
```

- Public site: http://localhost:3001
- Admin panel: http://localhost:3000 → http://localhost:3000/login
- API: http://localhost:4000/api

The backend container runs migrations and seeds sample data (an admin account and two
example pages) automatically on first boot.

**Seed credentials:** `admin@renewcred.dev` / `ChangeMe123!` — change this immediately in
any non-local environment.

## Running without Docker

```bash
# 1. Database
createdb renewcred_cms   # or run a local Postgres however you prefer

# 2. Backend
cd backend
cp .env.example .env     # point DATABASE_URL at your local Postgres
npm install
npx prisma migrate dev
npm run seed
npm run dev               # http://localhost:4000

# 3. Admin frontend
cd ../admin-frontend
cp .env.local.example .env.local
npm install
npm run dev                # http://localhost:3000

# 4. Public frontend
cd ../public-frontend
cp .env.local.example .env.local
npm install
npm run dev                # http://localhost:3001
```

## Architecture decisions

**Database: PostgreSQL + Prisma**, not MongoDB. Pages, blocks, admins, and media all have
a fairly regular relational shape (a page has many ordered blocks; a block belongs to one
page), and Prisma's migration history gives reviewable, versioned schema changes — a better
fit here than a schema-less document store, even though individual block payloads are
themselves flexible JSON.

**Content model.** A `Page` has many `Block` rows, each with a `type` and a JSON `data`
payload shaped by that type (validated server-side with Zod — see
`backend/src/validators/blockValidators.js`). Internal structure that's naturally
recursive or tabular — nested list items, table rows, mixed-style rich text runs — lives
*inside* that JSON rather than as further relational rows. This keeps "assemble a page" to
one indexed query (`blocks` ordered by `order`) while each block type owns validating and
rendering its own nested shape. Ten block types ship out of the box (heading, paragraph,
image, list, table, math/LaTeX, code, quote, divider, callout); adding an eleventh means
adding one Zod schema server-side and one renderer component on each frontend — no schema
migration required, since `data` is already `Json`.

**Auth.** JWT access tokens (15 min) live only in Redux memory on the client, never
localStorage, to limit XSS blast radius. A long-lived refresh token is an httpOnly,
`SameSite=Lax` cookie scoped to `/api/auth`; only its SHA-256 hash is stored server-side,
so a database leak alone can't be replayed. Refresh tokens rotate on every use and old
ones are marked revoked. Passwords are hashed with bcrypt (cost 12).

**Redux vs. local state (admin panel).** Redux holds two things: the authenticated admin's
identity/token, and the page + blocks currently being edited — because three independent
UI regions (block canvas, page meta bar, reorder logic) all read and mutate that same list.
Everything ephemeral — which block is focused, whether a dropdown is open, in-progress
drag state, unsaved form drafts before submit — stays as local `useState`, since no sibling
component needs it and routing it through Redux would just add dispatch noise. Block edits
update Redux instantly (so typing feels responsive) and persist to the API debounced
(600ms), not on every keystroke.

**Rich text scope.** Rather than a full contenteditable rich-text engine, each text run is
edited as plain text with per-run bold/italic/code toggles, and a block can mix several
differently-styled runs. This trades some editing polish for a data shape (`InlineRun[]`)
that's simple, predictable, and exactly what the renderer consumes — a deliberate scoping
decision given the assignment's own framing ("not to implement every possible feature, but
to demonstrate thoughtful engineering decisions").

**Public site rendering.** Server Components fetch from `/api/public/pages` and
`/api/public/pages/:slug` (unauthenticated, published-only) with ISR (`revalidate: 60`), so
published edits appear within a minute without a redeploy, while still getting static
performance most of the time. `generateStaticParams` pre-renders all published pages at
build time when the backend happens to be reachable during the build, and degrades to
on-demand rendering (rather than failing the build) when it isn't — relevant because Docker
Compose builds each image independently of container start order.

## API overview

All routes are prefixed `/api`. Admin routes require `Authorization: Bearer <accessToken>`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | open once, then SUPER_ADMIN | Create an admin |
| POST | `/auth/login` | — | Get access token + refresh cookie |
| POST | `/auth/refresh` | refresh cookie | Rotate access token |
| POST | `/auth/logout` | — | Revoke refresh token |
| GET | `/auth/me` | ✓ | Current admin |
| GET/POST | `/pages` | ✓ | List / create pages |
| GET/PATCH/DELETE | `/pages/:id` | ✓ | Read / update / delete a page |
| POST | `/pages/:pageId/blocks` | ✓ | Add a block |
| PATCH | `/pages/:pageId/blocks/reorder` | ✓ | Bulk reorder (transactional) |
| PATCH/DELETE | `/blocks/:id` | ✓ | Update / delete a block |
| POST/GET | `/media` | ✓ | Upload / list images |
| GET | `/public/pages` | — | Published pages (nav) |
| GET | `/public/pages/:slug` | — | One published page with blocks |

Every mutating route validates its body with Zod before touching the database; validation
errors return `400` with a field-level breakdown.

## Environment variables

See `backend/.env.example`, `admin-frontend/.env.local.example`, and
`public-frontend/.env.local.example`. The only secrets that matter in production are
`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — generate real random values
(`openssl rand -hex 32`) before deploying anywhere but localhost.

## Assumptions made

- No Figma design was matched pixel-for-pixel (agreed scope for this build) — both
  frontends use an original design system instead: a cool ink/indigo tool aesthetic for the
  admin panel, and a warm cream/clay editorial aesthetic for the public site.
- "Rich content" scope is the ten block types listed above, not an open-ended plugin
  system — extensible, but not built out further than the assignment's examples.
- Single admin role tier beyond `SUPER_ADMIN`/`EDITOR` was enough; no per-page permissions.
- Media library is local disk storage (`backend/uploads`, volume-mounted in Docker) rather
  than S3/Cloudinary — swappable behind `mediaController.js` without touching callers.
- Table cells are plain text, not rich text, to keep the model tractable.

## Testing checklist

- [x] Backend: every source file passes `node --check`; `npm install` clean
- [x] Backend: Prisma schema is valid (`prisma format`/schema loads without error)
- [x] Admin frontend: `tsc --noEmit` clean, `next lint` clean, `next build` succeeds
      (verified full production build and static-page generation for all routes)
- [x] Public frontend: `tsc --noEmit` clean, `next lint` clean, `next build` succeeds,
      including the on-demand-rendering fallback when the backend is unreachable at build time
- [ ] Live end-to-end run (login → create page → add each block type → publish → view on
      public site) — could not be executed in the environment this was built in, because
      that sandbox's network egress blocks `binaries.prisma.sh`, which `prisma generate`
      and `prisma migrate` need to download their query/migration engine. This is specific
      to that build environment, not the code; `docker compose up --build` or a normal dev
      machine with internet access will hit no such restriction. **Please run through this
      checklist yourself after `docker compose up` and treat this item as unverified until
      you do.**

## Tech stack

Next.js 14 (App Router) · Redux Toolkit · TailwindCSS · Express · PostgreSQL · Prisma ·
JWT + bcrypt · Zod · KaTeX · @dnd-kit · Docker Compose
