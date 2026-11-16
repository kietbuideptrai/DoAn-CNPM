# Artifact Guide Backend

Express API for the multilingual artifact guide.

## Local setup

From the repository root:

```bash
cd backend
npm install
cp .env.example .env
```

Set `DATABASE_URL` in `.env` to the PostgreSQL connection string from Supabase.
For a long-running Express server, use the Supabase session pooler or direct
connection details appropriate for your network. Require TLS and never commit
`.env`.

For certificate verification, download the Supabase root certificate from
**Database → SSL Configuration** and use `sslmode=verify-full` with
`sslrootcert` pointing to the local certificate file in `DATABASE_URL`.
Keep the certificate local; `.gitignore` excludes `prod-ca-2021.crt`.

Follow the non-production database confirmation, schema preflight, safe seed,
and read-only verification steps in
[`src/db/README.md`](./src/db/README.md) before applying schema or sample data.
Then start the API:

```bash
npm run dev
```

The API listens on `http://localhost:3000` by default. Vite's
`http://localhost:5173` and `http://127.0.0.1:5173` origins are allowed for
local development.

## Sample data

`src/db/seed.sql` is draft development data. It inserts missing artifact and
translation rows only, leaves existing rows unchanged, and creates new
artifacts as unpublished. Its Vietnamese summaries are paraphrased from the
Ho Chi Minh Museum's “Artifacts Tell Stories” articles; all five-language text
is draft content pending expert review. Images remain neutral placeholders
until usage rights are confirmed. Content and image review status are tracked in
[`src/db/CONTENT-REVIEW.md`](./src/db/CONTENT-REVIEW.md) and
[`src/db/image-sources.json`](./src/db/image-sources.json).

The translation importer accepts UTF-8 comma- or semicolon-delimited CSV. It
does not overwrite existing metadata or translations by default. Review
conflicts first; `--overwrite-existing` explicitly enables updates.

After content review, image-rights confirmation, and explicit non-production
database verification, use [`src/db/verify-seed.sql`](./src/db/verify-seed.sql)
and [`src/db/verify-demo-readiness.sql`](./src/db/verify-demo-readiness.sql)
as read-only checks, then verify the public API. Do not publish draft records
or describe unreviewed content/placeholders as approved data.

## Deploy to Render

Create a **Web Service** from the repository and configure:

- **Root Directory:** `backend`
- **Build Command:** `npm ci --include=dev && npm run build`
- **Start Command:** `npm start`

Add these environment variables in the Render service settings:

- `DATABASE_URL`: Supabase PostgreSQL connection string with TLS enabled.
- `CORS_ORIGINS`: comma-separated exact web origins, for example
  `https://your-project.vercel.app`.
- `NODE_ENV`: `production` (Render provides `PORT` for the service).

## Deploy to Railway

Create a Railway service from the repository and set its **Root Directory** to
`/backend`. Configure:

- **Build Command:** `npm ci --include=dev && npm run build`
- **Start Command:** `npm start`

Set `DATABASE_URL`, `CORS_ORIGINS`, and `NODE_ENV=production` in the service
variables. Railway provides `PORT` automatically. If using a Supabase pooler,
use its session mode for this long-running Express process.

`CORS_ORIGINS` accepts comma-separated exact origins without path segments or
trailing slashes. Local HTTP origins on `localhost`, `127.0.0.1`, and `::1` are
also allowed.

## API

- `GET /api/health` — returns separate backend and database checks. HTTP 200
  means both checks passed; HTTP 503 means the API is running but the database
  is unavailable. The response never includes connection details.
- `GET /api/languages`
- `GET /api/artifacts?lang=vi&q=tank`
- `GET /api/artifacts/:slug?lang=vi`

Artifact list searches `q` case-insensitively and partially against the
Vietnamese artifact name and English translation title, regardless of the
requested display language. Only published artifacts are returned.

Before a demo, call the deployed backend's `/api/health` endpoint and confirm
HTTP 200 with both checks marked `ok`. If it returns HTTP 503, the backend is
reachable but the database check failed; verify service/database availability
and configuration without sharing the `DATABASE_URL`. Call the endpoint early
enough to allow a paused free-tier service to wake up, then check it again
before the demo.

Run `npm test` from `backend/` to verify backend health, database failure
handling, seed safety, and search query behavior.
