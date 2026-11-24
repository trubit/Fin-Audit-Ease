# Phase 18 — Comprehensive Technical Investigation & Architecture Report
## FinAuditEase Independent Administration Platform Separation
**Powered by Sabi Africa Innovations Limited**
*Generated: November 2026*

---

### Executive Summary

This investigation provides the root-cause analysis, system auditing, and precise implementation plan required to separate the **FinAuditEase Platform** into two completely decoupled, independently deployable frontend applications:
1. **Application A — FinAuditEase User Application** (Auditors, Corporate Accounting Teams / SMEs, Audit Engagement Managers).
2. **Application B — FinAuditEase Admin Platform** (Dedicated Enterprise Administration Console for Platform Governance, User & Organisation Directory, Engagement Oversight, Compliance, and Security).

---

### 12-Point Mandatory Repository & Architectural Audit

#### 1. Scan the Complete Existing Repository
- **Core Technology Stack:** React 19.2.8, Vite 8.3.0, TypeScript 6.0.2, `@tanstack/react-query` 5.104.1, `react-router-dom` 7.18.4, `zustand` 5.0.15, `i18next` 26.4.2 (5 locales: English, Yorùbá, Igbo, Hausa, Nigerian Pidgin).
- **Directory Structure:**
  - `src/app`: Application shell, providers, and unified routing.
  - `src/features`: Domain modules (`auth`, `admin-auth`, `audit-requests`, `engagements`, `documents`, `review`, etc.).
  - `src/pages`: User pages and nested `src/pages/admin/*`.
  - `src/components`: UI components, including `AppSidebar`, `AppHeader`, `AdminSidebar`, `AdminHeader`.
  - `src/layouts`: `MainLayout`, `PublicLayout`, `AuthLayout`, and `AdminLayout`.

#### 2. Identify the Current Frontend Application Structure
- Currently, the application is bundled through a single Vite entry point: `index.html` -> `src/main.tsx` -> `src/app/App.tsx` -> `src/app/router/AppRouter.tsx` (`appRoutes`).
- Both ordinary user pages and enterprise administrative pages are loaded within this single router instance.

#### 3. Identify Existing Backend Structure and API Configuration
- Defined in `src/services/api/endpoints.ts`.
- All administrative backend routes are prefixed with `/api/v1/admin/` (`AUTH`, `DASHBOARD`, `USERS`, `ORGANISATIONS`, `AUDITORS`, `AUDIT_MANAGERS`, `ENGAGEMENTS`, `SUBSCRIPTIONS`, `COMMUNICATION`, `AUDIT_TRAIL`, `REPORTS`, `NOTIFICATIONS`, `SECURITY`, `SETTINGS`, `ROLES_PERMISSIONS`).
- Frontend service layer: `src/features/admin-auth/services/adminAuthService.ts` and related API hooks consume these endpoints.

#### 4. Inspect Authentication and Authorization
- User Auth: Managed via `useAuthStore` and session key `fae_auth_session`.
- Admin Auth: Managed via dedicated `useAdminAuthStore` (`src/store/adminAuthStore.ts`) and session key `fae_admin_session`.
- Security Boundary: `AdminProtectedRoute.tsx` enforces `role === 'ADMIN'` and validates `adminUser`. Ordinary user sessions (Auditor, SME) cannot access administrative endpoints or admin views.
- Strict isolation: Admin and User auth sessions are completely separated at the storage and state level.

#### 5. Inspect Routing and Navigation
- **Violation in User Routing:** `src/app/router/routes.tsx` currently contains lines 492–633 which declare `/admin/*` and `/admin/login` inside the user app router.
- **Violation in User Sidebar:** `src/components/layout/AppSidebar/AppSidebar.tsx` (lines 90–98) injects an `{ to: '/admin/dashboard', label: 'Admin Platform' }` navigation item when `user?.role === 'ADMIN'`.
- **Violation in Admin Sidebar:** `src/components/layout/AdminSidebar/AdminSidebar.tsx` (lines 184–189) injects an `{ to: '/dashboard', label: 'User Workspace View' }` link.

#### 6. Inspect Environment Variables and Configuration
- Supported environment flags: `VITE_API_BASE_URL`, `VITE_ENABLE_DEV_AUTH`.
- Independent configuration requirement: The Admin Platform will be configured to support independent API host resolution and administrative environment overrides if required (e.g. `VITE_ADMIN_API_BASE_URL`).

#### 7. Inspect package.json Files and Build Scripts
- `package.json` contains:
  - `"build": "tsc -b && vite build"`
- For independent deployment and multi-entry building, we need:
  - Multi-page input in `vite.config.ts`: `main` (`index.html`) and `admin` (`admin.html`).
  - Targeted scripts in `package.json`:
    - `"build"`: builds both targets for production distribution.
    - `"build:user"`: builds the user application.
    - `"build:admin"`: builds the admin application.

#### 8. Inspect Current Deployment Configuration
- `vercel.json` currently directs all traffic (`/(.*)`) to `/index.html`.
- To support independent domains/subdomains (e.g., `admin.finauditease.app` or dedicated deployment paths):
  - Add host-based and path-based rewrites directing administrative traffic to `/admin.html`.

#### 9. Identify the Existing Admin Platform Implementation
- Fully designed administrative pages exist in `src/pages/admin/`:
  - `AdminDashboardPage.tsx`
  - `AdminUsersPage.tsx`
  - `AdminOrganisationsPage.tsx`
  - `AdminAuditorsPage.tsx`
  - `AdminAuditManagersPage.tsx`
  - `AdminEngagementsPage.tsx`
  - `AdminSubscriptionsPage.tsx`
  - `AdminCommunicationPage.tsx`
  - `AdminAuditTrailPage.tsx`
  - `AdminReportsPage.tsx`
  - `AdminNotificationsPage.tsx`
  - `AdminSecurityPage.tsx`
  - `AdminSettingsPage.tsx`
  - `AdminRolesPermissionsPage.tsx`
  - `AdminLoginPage.tsx`
- All pages are styled with enterprise design tokens in `AdminPages.css` and adhere to the approved high-fidelity design specifications in `phase18-design/`.

#### 10. Identify Components, Routes, or Layouts That Incorrectly Mix Experiences
- `src/components/layout/AppSidebar/AppSidebar.tsx`: Leaks `/admin/dashboard` link.
- `src/app/router/routes.tsx`: Contains `/admin/*` and `/admin/login` inside the user bundle.
- `src/components/layout/AdminSidebar/AdminSidebar.tsx`: Leaks `/dashboard` (User Workspace) link.

#### 11. Identify Existing Administrative Modules and Backend Connections
- All administrative modules map directly to the backend contracts in `src/services/api/endpoints.ts` under `API_ENDPOINTS.ADMIN`.
- No mock data or fake endpoints are used; all requests flow through real HTTP clients and endpoints.

#### 12. Identify the Safest Way to Separate the Applications Without Breaking the User App
- **Step 1:** Purge all `/admin` route definitions and lazy imports from `src/app/router/routes.tsx`.
- **Step 2:** Purge the Admin Platform navigation link from `src/components/layout/AppSidebar/AppSidebar.tsx`.
- **Step 3:** Purge the User Workspace link from `src/components/layout/AdminSidebar/AdminSidebar.tsx`.
- **Step 4:** Create `admin.html` with its own HTML shell, metadata, and bundle loader (`/src/admin-main.tsx`).
- **Step 5:** Create `src/admin-main.tsx`, `src/admin/AdminApp.tsx`, and `src/admin/router/adminRoutes.tsx` as an independent frontend application.
- **Step 6:** Configure `vite.config.ts` with multi-page Rollup inputs (`index.html` and `admin.html`).
- **Step 7:** Update `vercel.json` with host-based and route rewrites for independent domain/subdomain routing.
- **Step 8:** Verify complete build, lint, and test pass rate with 0 errors across 5 supported languages.

