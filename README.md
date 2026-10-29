# FinAuditEase — Version 1 (Frontend Foundation)

FinAuditEase is an enterprise financial audit management and client collaboration platform. It bridges auditors and corporate accounting teams during audit engagements, Provided by Client requests, review workflows, checklists, and compliance trail verifications.

---

## 1. Architectural Purpose & Scope Boundary

> [!IMPORTANT]
> **Strict Frontend Architecture**
> This repository houses strictly frontend application code. All backend systems, database schemas, authentication servers, encryption routines, and PDF generation engines are architected and maintained separately by the backend engineering team.
>
> **No Fake Backend / No Mock Production APIs**: The frontend connects via centralized, typed API service boundaries. No mock databases, hardcoded business entities, or token signing exist within this frontend codebase.

---

## 2. Technology Stack

| Layer | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Runtime & Core** | React 19, TypeScript 6, Vite 8 | Ultra-fast build times, strong static typing, ESM bundling. |
| **Routing** | React Router v7 (`react-router-dom`) | Declarative client routing, code-splitting, and route guards. |
| **Client UI State** | Zustand | Lightweight client UI preferences (sidebar, modals, drawers). |
| **Server State** | TanStack Query (`@tanstack/react-query` v5) | Caching, invalidation, lifecycle, and server synchronization. |
| **Forms & Validation** | React Hook Form, Zod | Type-safe form validation and field registration. |
| **Internationalization** | i18next, `react-i18next` | 5 Nigerian languages (`en`, `yo`, `ig`, `ha`, `pcm`) with verified Unicode. |
| **PWA Support** | `vite-plugin-pwa` (Workbox) | Offline manifest and secure caching without persisting private documents. |
| **Styling** | Custom Vanilla CSS & Design Tokens | Zero-bloat financial SaaS aesthetic with high contrast and WCAG AAA compliance. |
| **Linting** | Oxlint | High-speed static analysis for React rules of hooks and purity. |

---

## 3. Project Structure

```
src/
├── app/
│   ├── App.tsx                     # Root App component
│   ├── providers/
│   │   └── AppProviders.tsx        # TanStack Query & i18n root provider
│   └── router/
│       ├── AppRouter.tsx           # RouterProvider instantiation
│       ├── ProtectedRoute.tsx      # Enterprise session & role guard
│       └── routes.tsx              # Code-split lazy loaded routes
│
├── assets/
│   ├── images/                     # Asset photography guidelines & hero layout rules
│   ├── icons/                      # SVGs and UI markers
│   └── fonts/                      # Latin & Latin Extended font definitions
│
├── components/
│   ├── common/                     # Button, Card, Badge, Input
│   ├── feedback/                   # LoadingSkeleton, Spinner, ErrorBoundary, Toast, EmptyState, SessionTimeoutModal
│   ├── forms/                      # FormField, accessible form input wrappers
│   ├── layout/                     # AppHeader, AppSidebar, AppFooter, PageContainer
│   └── navigation/                 # LanguageSwitcher, NavMenu
│
├── config/
│   ├── env.config.ts               # Safe typed environment variable parser
│   └── app.config.ts               # Brand constants, limits (25MB max upload), locale list
│
├── features/
│   ├── auth/                       # Auth types, roles, useAuth hook abstraction
│   ├── engagements/                # Engagement domain entities and milestone contracts
│   ├── auditRequests/              # PBC request entity models and create payloads
│   ├── documents/                  # Document metadata, upload types & validation utility (25MB, PDF/Excel/Word/JPEG/PNG)
│   ├── checklists/                 # Pre-audit and month-end close checklist models
│   ├── review/                     # Auditor review, feedback, and approval workflow types
│   ├── notifications/              # Alert and notification center domain contracts
│   └── auditTrail/                 # Immutable audit trail record contracts
│
├── hooks/
│   ├── useSessionTimeout.ts        # 30-minute inactivity timer with warning modal
│   └── useLanguage.ts              # Locale selector hook
│
├── i18n/
│   ├── locales/
│   │   ├── en.json                 # English
│   │   ├── yo.json                 # Èdè Yorùbá (ẹ, ọ, ṣ)
│   │   ├── ig.json                 # Asụsụ Igbo (ị, ụ, ọ)
│   │   ├── ha.json                 # Harshen Hausa
│   │   └── pcm.json                # Nigerian Pidgin
│   └── index.ts                    # i18next initialization & local storage persistence
│
├── layouts/
│   ├── RootLayout.tsx              # Global error boundary, toast provider, session listener
│   ├── PublicLayout.tsx            # Header, public outlet, footer
│   └── AppLayout.tsx               # Header, sidebar navigation, content area, footer
│
├── lib/
│   └── queryClient.ts              # TanStack Query client with caching policies
│
├── pages/
│   ├── public/                     # Home, Login, Signup, Forgot/Reset Password, 2FA, Accept Invitation
│   ├── app/                        # Dashboard, Engagements, Requests, Documents, Review, Checklists, Notifications, Audit Trail
│   └── feedback/                   # Unauthorized (403), NotFound (404), RouteShellPlaceholder
│
├── routes/
│   └── index.ts                    # Routing barrel exports
│
├── services/
│   └── api/
│       ├── apiClient.ts            # Central typed fetch client with abort timeouts
│       ├── apiErrors.ts            # Error code normalizer (400, 401, 403, 404, 409, 422, 429, 500, 502, 503)
│       └── endpoints.ts            # API route definitions catalogue
│
├── store/
│   ├── uiStore.ts                  # Zustand UI state (sidebar, drawers)
│   └── sessionStore.ts             # Session inactivity timer UX state
│
├── styles/
│   ├── tokens.css                  # CSS custom properties (colors, typography, spacing, shadows)
│   ├── reset.css                   # Modern CSS reset
│   ├── typography.css              # Font sizing, line heights, Unicode glyph optimizations
│   └── global.css                  # Aggregated stylesheet & reusable utility classes
│
├── types/
│   ├── api.types.ts                # API envelope (ApiResponse, RequestOptions, ResponseMeta)
│   └── common.types.ts             # Shared pagination, sort, and date range types
│
├── utils/
│   ├── formatters.ts               # Date & currency formatters
│   └── accessibility.ts            # ARIA descriptors and focus trap helpers
│
└── main.tsx                        # React application DOM entrypoint
```

---

## 4. Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation
```bash
# Clone the repository and enter the directory
cd fin-audit-ease

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
The application will start at `http://localhost:5173`.

### Production Build
```bash
# Type check and build bundle
npm run build

# Preview production build locally
npm run preview
```

### Code Quality & Linting
```bash
npm run lint
```

---

## 5. Environment Configuration

Copy `.env.example` to `.env`:
```env
# Central Backend API URL (Leave blank to use local origin)
VITE_API_BASE_URL=

# Application Environment
VITE_APP_ENV=development

# Session Inactivity Timeout (30 minutes in ms)
VITE_SESSION_TIMEOUT_MS=1800000

# Session Warning Lead Time (2 minutes in ms)
VITE_SESSION_WARNING_MS=120000
```

> [!CAUTION]
> **Frontend Security Warning**:
> Only `VITE_` variables are included in client bundles. Never place private keys, database passwords, JWT signing secrets, or encryption keys in `.env`.

---

## 6. API Integration Boundary

The frontend communicates with backend services through the central `apiClient` (`src/services/api/apiClient.ts`).

- **Sanitized Errors**: The API layer normalizes HTTP codes (400, 401, 403, 404, 409, 422, 429, 500, 502, 503) and network failures into safe user messages via `apiErrors.ts`.
- **Zero Information Leakage**: Stack traces, server paths, database exceptions, and tokens are never shown to end users or exposed in console logs.

---

## 7. Supported Languages & Internationalization

FinAuditEase provides first-class support for 5 languages with verified Unicode diacritics:
1. **English** (`en`)
2. **Èdè Yorùbá** (`yo`) — Full diacritic support: `ẹ`, `ọ`, `ṣ`
3. **Asụsụ Igbo** (`ig`) — Full diacritic support: `ị`, `ụ`, `ọ`
4. **Harshen Hausa** (`ha`) — Support for `ɓ`, `ɗ`, `ƙ`
5. **Naijá Pidgin** (`pcm`)

Languages can be changed instantly from the UI without reloading the page.

---

## 8. Progressive Web App (PWA) Architecture

Configured via `vite-plugin-pwa`:
- Web manifest with icons (`pwa-192x192.svg`, `pwa-512x512.svg`, `favicon.svg`)
- Primary theme color: `#0A2540`
- Background color: `#0A192F`
- **Security-First Caching Policy**:
  - Precaches static shell assets (JS, CSS, HTML, fonts, SVG)
  - Workbox navigation fallback denylist explicitly blocks `/api/*`
  - **Private audit documents and authenticated API responses are NEVER cached in service worker storage.**

---

## 9. Session Inactivity Architecture

Supports an automated **30-minute inactivity timeout**:
- Actively listens to user interaction events (mouse, keyboard, scroll, touch).
- Displays a non-intrusive warning modal at 28 minutes offering **"Stay Logged In"** or **"Log Out"**.
- At 30 minutes, gracefully redirects to `/login?session_expired=true` and clears local session cache.
- The frontend timer acts as a UX convenience layer; backend session validation remains the final authority.

---

## 10. File Upload Foundation

Document upload rules are enforced in `src/features/documents/utils/validation.ts`:
- **Max File Size**: 25MB (26,214,400 bytes).
- **Supported Formats**: PDF (`.pdf`), Excel (`.xlsx`, `.xls`), Word (`.docx`, `.doc`), JPEG (`.jpg`, `.jpeg`), PNG (`.png`).
- Abort controller integration for upload cancellation, progress indicators, and retry UX.
