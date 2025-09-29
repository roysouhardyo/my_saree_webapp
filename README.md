# Saree Not Sorry - E-commerce Platform

Last updated: 2025-09-29 07.09.31
 
## Deploy to Vercel

- Prerequisites
  - A MongoDB Atlas cluster and connection string (`MONGODB_URI`).
  - A strong `NEXTAUTH_SECRET` and the correct `NEXTAUTH_URL`.
  - Optional: Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

- Local setup
  - Copy `.env.example` to `.env.local` and fill in values.
  - Run `npm install` then `npm run build` to verify the app builds.

- Vercel environment variables
  - In the Vercel Dashboard, set the following for Production (and Preview if needed):
    - `MONGODB_URI`
    - `NEXTAUTH_SECRET`
    - `NEXTAUTH_URL` (e.g., `https://<your-project>.vercel.app`)
    - `GOOGLE_CLIENT_ID` (optional)
    - `GOOGLE_CLIENT_SECRET` (optional)

- Deployment
  - Push to GitHub/GitLab/Bitbucket and import the repo in Vercel, or use the Vercel CLI.
  - Ensure build command is `npm run build` and output directory is `.next` (already configured).
  - After deploy, verify authentication flows and API routes in the Production domain.

- Notes
  - The project uses serverless API routes with MongoDB; cold starts are mitigated via a connection cache.
  - Image optimization allows remote images via `next.config.ts` `images.remotePatterns`.
  - If Google OAuth isn’t configured, email/password auth still works.
