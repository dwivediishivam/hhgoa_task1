# Builder House — HH Goa 2026

A fast, mobile-first HH Goa identity studio: generate a Builder ID, a face-safe PFP frame, and a combined Crew Manifest. Images are composed locally in Canvas; only the compact social preview is uploaded after a visitor explicitly chooses **Share to X**.

The complete designer handoff lives in [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md).

## Run locally

```bash
npm install
npm run dev
```

Local download, crop controls, HEIC conversion, every format, and animations work with no environment variables.

## Enable a real X preview card

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.
3. Add these values to `.env.local` (copy `.env.example`):

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SUPABASE_SHARE_BUCKET=hhgoa-shares
```

4. Deploy to Vercel and add the same variables there. `SUPABASE_SERVICE_ROLE_KEY` must never use the `NEXT_PUBLIC_` prefix.

When someone clicks **Share to X**, the app generates a 1200×630 JPEG preview, stores it at an immutable public URL, creates `/share/<uuid>` with server-rendered Open Graph/Twitter metadata, and opens a pre-filled X intent containing `#FrameInGoa`. This is necessary because X Web Intents cannot attach a browser-local generated file.

## Submission checklist

- [ ] Deploy the site and test it on a real mobile device.
- [ ] Share a completed result to X from the deployed domain; verify the card preview appears.
- [ ] Post the required final X post with `#FrameInGoa`, the link, and a one-line “how to make yours.”
- [ ] Submit one team response before the HH Goa deadline.

## Stack

Next.js App Router, TypeScript, Canvas 2D, Framer Motion, client-side HEIC conversion, and Supabase Storage/Postgres for opt-in share links.
