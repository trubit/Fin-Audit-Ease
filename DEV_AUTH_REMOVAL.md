# FinAuditEase — Temporary Development Authentication Removal Checklist

This document details the exact files, routes, components, and store modifications to remove when the real backend authentication and business APIs are ready.

---

## 1. Files to Delete

Delete the entire temporary development feature directory and its associated test files:

```bash
# Delete dev-auth feature folder
rm -rf src/features/dev-auth/

# Delete dev-auth tests
rm src/features/dev-auth/__tests__/devAuth.test.ts

# Delete this document
rm DEV_AUTH_REMOVAL.md
```

Files contained in `src/features/dev-auth/`:
- `src/features/dev-auth/types.ts`
- `src/features/dev-auth/constants.ts`
- `src/features/dev-auth/services/devAuthService.ts`
- `src/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher.tsx`
- `src/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher.css`
- `src/features/dev-auth/pages/DevLoginPage.tsx`
- `src/features/dev-auth/pages/DevLoginPage.css`
- `src/features/dev-auth/index.ts`

---

## 2. Routes to Remove in `src/app/router/routes.tsx`

1. Remove lazy import of `DevLoginPage`:
   ```tsx
   // REMOVE:
   const DevLoginPage = import.meta.env.DEV
     ? lazy(() =>
         import('@/features/dev-auth/pages/DevLoginPage').then((m) => ({ default: m.DevLoginPage }))
       )
     : null
   ```

2. Remove conditional `/dev-login` route entry:
   ```tsx
   // REMOVE:
   ...(import.meta.env.DEV && DevLoginPage
     ? [
         {
           path: '/dev-login',
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

## 3. Layout Cleanup in `src/layouts/AppLayout.tsx`

1. Remove import:
   ```tsx
   // REMOVE:
   import { DevRoleSwitcher } from '@/features/dev-auth/components/DevRoleSwitcher/DevRoleSwitcher'
   ```

2. Remove JSX mount:
   ```tsx
   // REMOVE:
   {import.meta.env.DEV && <DevRoleSwitcher />}
   ```

---

## 4. Auth Store Cleanup

In `src/features/auth/types.ts`:
- Remove `authMode?: 'real' | 'development'` from `AuthState`.

In `src/store/authStore.ts`:
- Remove `setDevAuthenticatedUser` from `AuthStoreState` and `useAuthStore`.
- Remove `authMode: 'real'` initialization.

In `src/features/auth/hooks/useAuth.ts`:
- Remove `authMode` and `setDevAuthenticatedUser` exports.
- Simplify `logout()` to call real `authService.logout()` directly without branching on `authMode`.

In `src/hooks/useSessionTimeout.ts`:
- Simplify session expiration redirect to unconditionally navigate to `/login?session_expired=true`.

In `src/pages/public/LoginPage.tsx`:
- Remove the development preview link in `footerLinks`.

---

## 5. i18n Translation Keys

Remove the `"devAuth"` object from the five locale files:
- `src/i18n/locales/en.json`
- `src/i18n/locales/yo.json`
- `src/i18n/locales/ig.json`
- `src/i18n/locales/ha.json`
- `src/i18n/locales/pcm.json`
