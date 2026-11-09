## Apply and verify data safely

The backend connects to PostgreSQL using `DATABASE_URL` from `pool.ts`. Never
paste this URL into chat, logs, tickets, or shell output.

1. Select the intended Supabase project in its dashboard and confirm that it is
   a dedicated non-production project. Compare its project ref with the host
   in `DATABASE_URL` locally; for pooler URLs, also check the username's
   `postgres.<project-ref>` portion. Do not connect or run SQL if they do not
   match. The application cannot determine whether a project is shared or
   production merely from the hostname.
2. Before applying schema changes to an existing project, inspect its tables
   and constraints in the Supabase dashboard. `schema.sql` uses plain
   `CREATE TABLE`, not an idempotent migration. Apply it only to an empty,
   confirmed non-production database. If any target table already exists,
   stop and review the schema/migration plan instead of rerunning it.
3. Before seeding, run read-only checks for the eight known sample slugs and
   record which already exist. Review `CONTENT-REVIEW.md` and
   `image-sources.json`; the sample copy is unapproved draft text, and current
   placeholder images are not approved exhibit photos.
4. Run `seed.sql` only after explicitly confirming the target project. The
   script inserts missing artifacts as unpublished and inserts missing
   translations. Its `ON CONFLICT DO NOTHING` clauses do not update existing
   artifact names, image URLs, publication state, or translations. Existing
   rows with the same slug keep their current values; new placeholder-image
   rows remain unpublished.
5. Run `verify-seed.sql` to inspect seed-row presence and translation/image
   status. Run `verify-demo-readiness.sql` to check the number of published
   artifacts that have all five translations. These scripts are read-only.
   Resolve missing translations and placeholder images through an approved,
   reviewed change; do not mark drafts published as a verification shortcut.
6. Start the backend using the same confirmed `DATABASE_URL`. Verify
   `GET /api/health` returns HTTP 200 with backend and database both `ok`.
   Then request `GET /api/languages` and
   `GET /api/artifacts?lang=vi`, `en`, `zh`, `ja`, and `ko`; confirm the API
   returns the expected published artifacts in each language. A healthy
   database check alone does not establish that schema/data or API reads are
   correct.

Do not run schema or seed against production, shared, or unconfirmed
databases. If the project ref does not match, stop and correct the local
configuration before any connection attempt.
