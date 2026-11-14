# FinAuditEase — Temporary Development Authentication Removal Checklist (Post-Phase 18)

## Executive Summary

This document details the exact files, routes, components, layout mounts, and store modifications to remove when the genuine backend authentication and business APIs are deployed and operational.

> [!IMPORTANT]
> **DO NOT PERFORM THIS DELETION UNTIL THE BACKEND AUTH SERVICE IS FULLY DEPLOYED.**
> While the backend is in progress, the temporary development auth system (`DEV_AUTH`) powers local UI development, role simulation (`AUDITOR`, `FINANCE_USER`, `ADMIN`), and route testing.

---

## 1. Files & Directories to Delete

Delete the entire temporary development feature directory and its associated test files:

```bash
# Delete dev-auth feature folder (all components, services, pages, and utils)
rm -rf src/features/dev-auth/

# Delete dev-auth unit tests
rm src/features/dev-auth/__tests__/devAuth.test.ts

# Delete this removal guide
rm DEV_AUTH_REMOVAL.md
```

### Complete Inventory of Files to be Deleted:
- `src/features/dev-auth/types.ts`
- `src/features/dev-auth/constants.ts`
- `src/features/dev-auth/index.ts`
- `src/features/dev-auth/services/devAuthService.ts`
- `src/features/dev-auth/utils/isDevAuthEnabled.ts`
- `src/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher.tsx`
- `src/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher.css`
- `src/features/dev-auth/pages/DevLoginPage.tsx`
- `src/features/dev-auth/pages/DevLoginPage.css`
- `src/features/dev-auth/__tests__/devAuth.test.ts`
- `DEV_AUTH_REMOVAL.md`

---

## 2. Router Cleanup in `src/app/router/routes.tsx`

1. **Remove Imports & Lazy Loaders**:
   ```tsx
   // REMOVE:
   import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'

   // REMOVE:
   const DevLoginPage = lazy(() =>
     import('@/features/dev-auth/pages/DevLoginPage').then((m) => ({ default: m.DevLoginPage }))
   )
   ```

2. **Remove Conditional Route Entries**:
   Remove the conditional route definitions for `/dev-login` and `/dev-auth`:
   ```tsx
   // REMOVE THIS BLOCK:
   ...(isDevAuthEnabled() && DevLoginPage
     ? [
         {
           path: '/dev-login',
           element: (
             <Suspense fallback={<RouteSuspenseFallback />}>
               <DevLoginPage />
             </Suspense>
           ),
         },
         {
           path: '/dev-auth',
           element: (
             <Suspense fallback={<RouteSuspenseFallback />}>
               <DevLoginPage />
             </Suspense>
           ),
         },
       ]
     : []),
   ```

---

## 3. Layout Cleanup in `AppLayout.tsx` & `AdminLayout.tsx`

### 3.1 `src/layouts/AppLayout.tsx`
1. **Remove Imports**:
   ```tsx
   // REMOVE:
   import { DevRoleSwitcher } from '@/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher'
   import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
   ```

2. **Remove JSX Mount**:
   ```tsx
   // REMOVE:
   {isDevAuthEnabled() && (
     <ErrorBoundary fallback={null}>
       <DevRoleSwitcher />
     </ErrorBoundary>
   )}
   ```

### 3.2 `src/layouts/AdminLayout.tsx` (Phase 18 Admin Platform)
1. **Remove Imports**:
   ```tsx
   // REMOVE:
   import { DevRoleSwitcher } from '@/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher'
   import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
   ```

2. **Remove JSX Mount**:
   ```tsx
   // REMOVE:
   {isDevAuthEnabled() && (
     <ErrorBoundary fallback={null}>
       <DevRoleSwitcher />
     </ErrorBoundary>
   )}
   ```

---

## 4. Public Login Page Cleanup in `src/pages/public/LoginPage.tsx`

1. **Remove Import**:
   ```tsx
   // REMOVE:
   import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
   ```

2. **Remove Dev Login Shortcut Link**:
   Remove the conditional rendering of the development login shortcut banner/link in `LoginPage.tsx`:
   ```tsx
   // REMOVE:
   {isDevAuthEnabled() && (
     <Link to="/dev-login" className="dev-login-shortcut-link">
       {t('devAuth.bannerTitle', 'Development Preview Mode')}
     </Link>
   )}
   ```

---

## 5. Session & Auth Store Cleanup

### 5.1 `src/features/auth/types.ts`
- Remove `authMode?: 'real' | 'development'` from `AuthState` interface:
  ```ts
  export interface AuthState {
    user: UserProfile | null
    status: AuthStatus
    isAuthenticated: boolean
    // REMOVE: authMode?: 'real' | 'development'
  }
  ```

### 5.2 `src/store/authStore.ts`
1. **Remove Imports & Constants**:
   ```ts
   // REMOVE:
   import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
   const DEV_SESSION_KEY = 'fae_dev_auth_session'
   ```
2. **Remove `setDevAuthenticatedUser` from `AuthStoreState`**:
   ```ts
   export interface AuthStoreState extends AuthState {
     readonly setAuthenticatedUser: (user: UserProfile) => void
     // REMOVE: readonly setDevAuthenticatedUser: (user: UserProfile) => void
     readonly setUnauthenticated: () => void
     readonly setLoading: (loading: boolean) => void
   }
   ```
3. **Simplify Initial State**:
   Remove `getInitialDevSession()` and initialize directly:
   ```ts
   export const useAuthStore = create<AuthStoreState>((set) => ({
     user: null,
     status: 'loading',
     isAuthenticated: false,
     setAuthenticatedUser: (user) => { ... },
     setUnauthenticated: () => { ... },
     setLoading: (loading) => set({ status: loading ? 'loading' : 'unauthenticated' }),
   }))
   ```

### 5.3 `src/features/auth/hooks/useAuth.ts`
1. Remove `authMode` and `setDevAuthenticatedUser` from the hook return object.
2. In `logout()`, remove the `if (authMode === 'real')` branch and call `await authService.logout()` unconditionally.

### 5.4 `src/hooks/useSessionTimeout.ts`
1. **Remove Import**:
   ```ts
   // REMOVE:
   import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
   ```
2. Simplify the timeout handler: Remove the development check branch and unconditionally dispatch session expiration redirect to `/login?session_expired=true`.

---

## 6. i18n Translation Key Cleanup

Remove the `"devAuth"` section from all 5 official localization files:
- `src/i18n/locales/en.json`
- `src/i18n/locales/yo.json`
- `src/i18n/locales/ig.json`
- `src/i18n/locales/ha.json`
- `src/i18n/locales/pcm.json`

---

## 7. Post-Removal Verification Checklist

After performing the deletions and cleanups, execute the following commands in the terminal:

```bash
# 1. Run linter to ensure no broken or unused imports
npm run lint

# 2. Run unit and integration tests
npm run test

# 3. Run TypeScript check and production build
npm run build
```

**Expected Outcome:**
- 0 ESLint/oxlint warnings or errors.
- All test suites passing with 100% success.
- `tsc -b && vite build` completes cleanly with 0 TypeScript compilation errors.

