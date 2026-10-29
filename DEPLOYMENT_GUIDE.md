# FinAuditEase — Production Frontend Deployment Guide (Phase 17)

## Overview

This guide details the deployment architecture, hosting requirements, and environment setup for deploying the FinAuditEase single-page application (SPA).

---

## 1. Build Verification & Artifacts

### 1.1 Production Build Command
```bash
npm run build
```
This command executes:
1. `tsc -b` — Strict TypeScript type-checking across project references.
2. `vite build` — Bundles the application with Vite, code-splits routes, processes CSS tokens, and generates the Workbox PWA service worker.

### 1.2 Output Directory (`dist/`)
The resulting build directory contains:
- `index.html` — The main HTML entry point with preload directives and font configurations.
- `assets/` — Content-hashed JavaScript and CSS bundles for aggressive browser caching (`Cache-Control: public, max-age=31536000, immutable`).
- `manifest.webmanifest` — PWA Web Application Manifest.
- `sw.js` & `workbox-*.js` — Service worker scripts for PWA capabilities.
- `registerSW.js` — PWA auto-update registration script.
- `public/` static assets: favicon, Apple touch icons, PWA icons, and the official Sabi Africa Innovations logo.

---

## 2. Environment Variables Configuration

The frontend requires the following build-time or runtime environment variables (defined via `.env` or CI/CD deployment environment settings):

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Fully qualified origin of the backend REST API | `https://api.finauditease.ng` |
| `VITE_APP_ENV` | Optional | Deployment environment (`production`, `staging`, `development`) | `production` |
| `VITE_SESSION_TIMEOUT_MS` | Optional | Inactivity timeout in ms (default: 30 mins) | `1800000` |
| `VITE_SESSION_WARNING_MS` | Optional | Inactivity warning dialog trigger in ms (default: 2 mins) | `120000` |

> [!WARNING]
> Because Vite embeds `VITE_*` variables at build time, ensure `VITE_API_BASE_URL` is set to the correct production backend URL before running `npm run build`.

---

## 3. Web Server & SPA Routing Fallback Requirements

Because FinAuditEase uses HTML5 History API client-side routing (`react-router-dom`), the hosting web server MUST route all unknown subpaths to `index.html` with HTTP status `200`.

### 3.1 Nginx Configuration
```nginx
server {
    listen 80;
    server_name app.finauditease.ng;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.finauditease.ng;

    # SSL certificates
    ssl_certificate /etc/ssl/certs/finauditease.crt;
    ssl_certificate_key /etc/ssl/private/finauditease.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/finauditease/dist;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.finauditease.ng;" always;

    # Content-hashed static assets (Cache forever)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # PWA Service Worker (Never cache)
    location ~* (sw\.js|registerSW\.js|manifest\.webmanifest)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }

    # SPA Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### 3.2 Netlify Configuration (`_redirects`)
If deploying to Netlify, include in `public/_redirects`:
```text
/*    /index.html   200
```

### 3.3 Vercel Configuration (`vercel.json`)
If deploying to Vercel, include:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3.4 Dockerfile (Static Nginx Container)
```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_ENV=production
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 4. PWA Service Worker Caching Verification

- **Asset Pre-caching**: Static fonts, CSS, JavaScript, and icons are precached by Workbox for instant repeat visits.
- **API Cache Denylist**: The service worker explicitly excludes `/api/*` from caching (`navigateFallbackDenylist: [/^\/api/]`). No authenticated data is cached in Service Worker cache storage.
- **Service Worker Updates**: `sw.js` is registered with `autoUpdate: true`, prompting the browser to fetch the new service worker whenever a new version is deployed.

---

## 5. Deployment Readiness Checklist

- [x] Code compiled cleanly with `tsc -b && vite build` (zero errors).
- [x] Oxlint passed on all files (zero warnings, zero errors).
- [x] Vitest passed all 24 test suites / 239 tests.
- [x] Zero hardcoded API base URLs (driven by `VITE_API_BASE_URL`).
- [x] Zero secrets in source files or bundle.
- [x] Single unified card signup experience verified.
- [x] 5 Nigerian languages verified with 100% key parity.
- [x] Development preview authentication fully isolated under `import.meta.env.DEV` and stripped from production bundles.
- [x] Backend obligations documented in `BACKEND_HANDOFF_REQUIREMENTS.md`.
