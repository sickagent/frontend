# SickAgent Frontend

Frontend application for SickAgent (React + Vite), deployed at `https://sickagent.net`.

## Stack

- `React 18`
- `TypeScript`
- `Vite`
- `React Router`
- `Tailwind CSS`

## Local Development

Requirements:

- `Node.js 20+`
- `npm 10+`

Commands:

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` by default.

## Production Build

```bash
npm run build
```

This script performs:

1. TypeScript build check (`tsc -b`)
2. Vite production build into `web/`
3. SEO/static post-processing (`scripts/generate-static-seo.mjs`)

Final deploy directory: `frontend/web`.

## Deployment to `sickagent.net`

Upload the contents of `frontend/web` (or use it directly as the document root).

Minimal deployment flow:

```bash
npm ci
npm run build
```

Then sync `web/` to your hosting environment (rsync/scp/CI/CD).

## SPA Routing Notes

The app uses client-side routing (`/login`, `/app/...`, `/docs/...`), so direct URL access requires a fallback to `index.html`.

After build, these files are generated automatically:

- `web/.htaccess` - Apache fallback
- `web/_redirects` - Netlify fallback
- `web/login/index.html`, `web/register/index.html`, `web/auth/callback/index.html`, `web/app/.../index.html` - pre-generated SPA shell pages for common routes

If you use Nginx or Caddy, configure fallback rules in the web server config.

## Caching

Recommended strategy:

- `index.html` and other HTML pages: no cache (`no-store/no-cache`)
- `web/assets/*` (Vite hashed assets): long-lived cache (`immutable`)

This ensures users always get the latest app shell after deploy while JS/CSS stay fast via caching.

## Frontend Structure

- `src/` - application source code
- `scripts/generate-static-seo.mjs` - SEO/static page generation after build
- `web/` - production artifacts for publishing

## Common Issues

- **Direct access to `/login` returns 404**  
  SPA fallback is not configured on the host. Check rewrite/redirect rules.

- **Old version appears after deploy**  
  Usually caused by HTML caching in browser/CDN/reverse proxy. Verify HTML cache headers.