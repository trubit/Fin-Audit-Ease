# FinAuditEase — Frontend/Backend API Contract Inventory & Integration Matrix (Phase 15)

## Overview & Integration Architecture

This inventory documents all HTTP communication points between the FinAuditEase frontend application and the backend engineering services.

### Core Communication Pattern
```text
Frontend UI (React 19 / Vite)
    ↓
Typed Feature Hooks & Domain Services
    ↓
Centralized ApiClient & Error Normalizer
    ↓
Base URL Config (VITE_API_BASE_URL)
    ↓
REST API Endpoints (/api/v1/...)
    ↓
Authoritative Backend (Express / PostgreSQL)
```

---

## 1. Authentication & Session Management

### 1.1 `POST /api/v1/auth/login`
- **Feature**: Authentication
- **HTTP Method**: `POST`
- **Auth Required**: No (Public)
- **Role/Access**: Any
- **Request Parameters**: None
- **Request Body**:
  ```json
  {
    "email": "user@firm.ng",
    "password": "SecurePassword123!",
    "rememberMe": false
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr_001",
        "email": "user@firm.ng",
        "fullName": "Adebayo Ogunlesi",
        "role": "AUDITOR",
        "organizationId": "org_001",
        "organizationName": "Global Audit Partners",
        "isTwoFactorEnabled": false,
        "createdAt": "2026-10-01T00:00:00Z"
      },
      "requires2FA": false,
      "temporaryToken": null
    }
  }
  ```
- **Response Shape (2FA Required)**:
  ```json
  {
    "success": true,
    "data": {
      "requires2FA": true,
      "temporaryToken": "tmp_tok_xyz123",
      "channel": "EMAIL",
      "maskedDestination": "u***@firm.ng"
    }
  }
  ```
- **Error Shapes**:
  - `401 Unauthorized`: Invalid credentials
  - `422 Unprocessable Entity`: Validation failure (missing email/password)
  - `429 Too Many Requests`: Rate-limited login attempts
- **Cache / Query Key**: N/A (Mutation)
- **Mutation Invalidation**: N/A
- **Frontend Consumer**: [LoginPage.tsx](file:///c:/Users/USER/fin-audit-ease/src/pages/public/LoginPage.tsx), `authService.login`
- **Contract Status**: `CONFIRMED`

---

### 1.2 `POST /api/v1/auth/register`
- **Feature**: Organization & User Onboarding
- **HTTP Method**: `POST`
- **Auth Required**: No (Public)
- **Role/Access**: Auditor Firm or Accounting Team Self-Registration
- **Request Body (Auditor)**:
  ```json
  {
    "fullName": "Olawale Adeleke",
    "email": "lead.auditor@firm.ng",
    "password": "Password123!",
    "firmName": "Apex Assurance Partners",
    "professionalBody": "ICAN",
    "membershipNumber": "MB/2026/04918",
    "preferredLanguage": "en",
    "termsAccepted": true,
    "role": "AUDITOR"
  }
  ```
- **Request Body (Accounting Team)**:
  ```json
  {
    "fullName": "Ngozi Chidiebere",
    "email": "cfo@company.ng",
    "password": "Password123!",
    "companyName": "Zenith Food Industries PLC",
    "jobTitle": "Chief Financial Officer",
    "accountingYearEndDate": "2026-12-31",
    "preferredLanguage": "en",
    "termsAccepted": true,
    "role": "FINANCE_USER"
  }
  ```
- **Response Shape (201 Created / 200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "usr_002", "email": "...", "role": "..." },
      "requiresVerification": false,
      "message": "Account created successfully"
    }
  }
  ```
- **Error Shapes**:
  - `409 Conflict`: Email already registered / Organization name duplicate
  - `422 Unprocessable Entity`: Weak password, missing required ICAN membership
- **Cache / Query Key**: N/A (Mutation)
- **Mutation Invalidation**: N/A
- **Frontend Consumer**: [SignupPage.tsx](file:///c:/Users/USER/fin-audit-ease/src/pages/public/SignupPage.tsx), `authService.signup`
- **Contract Status**: `CONFIRMED`

---

### 1.3 `POST /api/v1/auth/logout`
- **Feature**: Session Termination
- **HTTP Method**: `POST`
- **Auth Required**: Yes (Session Cookie)
- **Role/Access**: Authenticated users
- **Request Body**: None
- **Response Shape (200 OK / 204 No Content)**: `{ "success": true }`
- **Cache / Query Key**: N/A
- **Mutation Invalidation**: `queryClient.clear()`
- **Frontend Consumer**: `useAuth.logout`, `authService.logout`
- **Contract Status**: `CONFIRMED`

---

### 1.4 `GET /api/v1/auth/me`
- **Feature**: Session Verification & Identity Hydration
- **HTTP Method**: `GET`
- **Auth Required**: Yes (Session Cookie)
- **Role/Access**: Authenticated users
- **Request Body**: None
- **Response Shape (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "usr_001",
      "email": "lead.auditor@firm.ng",
      "fullName": "Adebayo Ogunlesi",
      "role": "AUDITOR",
      "organizationId": "org_001",
      "organizationName": "Global Audit Partners",
      "isTwoFactorEnabled": true,
      "membershipNumber": "ICAN/2026/001",
      "createdAt": "2026-10-01T00:00:00Z"
    }
  }
  ```
- **Error Shapes**:
  - `401 Unauthorized`: Session cookie missing or expired (safely transitions client to unauthenticated state without redirect loops)
- **Cache / Query Key**: Handled by `useInitializeAuth` on startup and synced to `useAuthStore`
- **Frontend Consumer**: [useInitializeAuth.ts](file:///c:/Users/USER/fin-audit-ease/src/features/auth/hooks/useInitializeAuth.ts), `authService.getCurrentUser`
- **Contract Status**: `CONFIRMED`

---

### 1.5 `POST /api/v1/auth/2fa/verify`
- **Feature**: Two-Factor Authentication Verification
- **HTTP Method**: `POST`
- **Auth Required**: No (Pre-session temporary token)
- **Request Body**:
  ```json
  {
    "code": "123456",
    "temporaryToken": "tmp_tok_xyz123"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "usr_001", "role": "AUDITOR", ... }
    }
  }
  ```
- **Frontend Consumer**: [TwoFactorPage.tsx](file:///c:/Users/USER/fin-audit-ease/src/pages/public/TwoFactorPage.tsx), `authService.verify2FA`
- **Contract Status**: `CONFIRMED`

---

### 1.6 `POST /api/v1/auth/2fa/resend`
- **Feature**: Two-Factor Code Resend
- **HTTP Method**: `POST`
- **Request Body**: `{ "temporaryToken": "tmp_tok_xyz123" }`
- **Response Shape (200 OK)**: `{ "success": true, "message": "Code resent" }`
- **Frontend Consumer**: [TwoFactorPage.tsx](file:///c:/Users/USER/fin-audit-ease/src/pages/public/TwoFactorPage.tsx), `authService.resend2FA`
- **Contract Status**: `CONFIRMED`

---

### 1.7 `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password`
- **Feature**: Self-Service Password Recovery
- **HTTP Method**: `POST`
- **Request Bodies**:
  - Forgot: `{ "email": "user@firm.ng" }`
  - Reset: `{ "token": "rst_tok_123", "newPassword": "...", "confirmPassword": "..." }`
- **Frontend Consumer**: `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `authService`
- **Contract Status**: `CONFIRMED`

---

### 1.8 `GET /api/v1/auth/invitations/:token` & `POST /api/v1/auth/invitations/accept`
- **Feature**: Auditor-Initiated Engagement Invitation
- **HTTP Method**: `GET` / `POST`
- **Auth Required**: Token-based
- **Request Body (Accept)**:
  ```json
  {
    "invitationToken": "inv_sec_abc123",
    "fullName": "Chidinma Nwosu",
    "email": "cnwosu@clientcorp.ng",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "preferredLanguage": "en",
    "termsAccepted": true
  }
  ```
- **Response Shape (GET)**:
  ```json
  {
    "success": true,
    "data": {
      "organizationName": "Client Corporation PLC",
      "invitedEmail": "cnwosu@clientcorp.ng",
      "role": "FINANCE_USER",
      "inviterName": "Deloitte & Touche Nigeria",
      "engagementTitle": "FY2026 Statutory Financial Statement Audit",
      "expiresAt": "2026-10-15T00:00:00Z"
    }
  }
  ```
- **Frontend Consumer**: [SignupPage.tsx](file:///c:/Users/USER/fin-audit-ease/src/pages/public/SignupPage.tsx), `AcceptInvitationPage.tsx`
- **Contract Status**: `CONFIRMED`

---

## 2. Engagements Management

| Endpoint | Method | Auth | Role | Query / Body | Response Data | TanStack Query Key | Invalidation Trigger | Status |
|---|---|---|---|---|---|---|---|---|
| `/api/v1/engagements` | `GET` | Cookie | All | `status`, `search`, `page`, `limit` | `Engagement[]` | `['engagements', params]` | N/A | `CONFIRMED` |
| `/api/v1/engagements/:id` | `GET` | Cookie | All | URL `:id` | `Engagement` | `['engagement', id]` | N/A | `CONFIRMED` |
| `/api/v1/engagements` | `POST` | Cookie | Auditor, Manager, Admin | `CreateEngagementPayload` | `Engagement` | N/A (Mutation) | `['engagements']` | `CONFIRMED` |
| `/api/v1/engagements/:id/milestones` | `GET` | Cookie | All | URL `:id` | `EngagementMilestone[]` | `['engagement', id, 'milestones']` | N/A | `CONFIRMED` |
| `/api/v1/engagements/:id/members` | `GET` | Cookie | All | URL `:id` | `EngagementMember[]` | `['engagement', id, 'members']` | N/A | `CONFIRMED` |
| `/api/v1/engagements/:id/invitations` | `POST` | Cookie | Auditor, Manager, Admin | `InviteEngagementMemberPayload` | `InviteMemberResponse` | N/A (Mutation) | `['engagement', id, 'members']` | `CONFIRMED` |

---

## 3. Audit Requests (Provided by Client / PBC Schedules)

| Endpoint | Method | Auth | Role | Query / Body | Response Data | TanStack Query Key | Invalidation Trigger | Status |
|---|---|---|---|---|---|---|---|---|
| `/api/v1/audit-requests` | `GET` | Cookie | All | `engagementId`, `status`, `priority`, `search` | `AuditRequest[]` | `['auditRequests', params]` | N/A | `CONFIRMED` |
| `/api/v1/audit-requests/:id` | `GET` | Cookie | All | URL `:id` | `AuditRequest` | `['auditRequest', id]` | N/A | `CONFIRMED` |
| `/api/v1/audit-requests` | `POST` | Cookie | Auditor, Manager, Admin | `CreateAuditRequestPayload` | `AuditRequest` | N/A (Mutation) | `['auditRequests']`, `['engagement', engagementId]` | `CONFIRMED` |
| `/api/v1/audit-requests/:id/status` | `PATCH` | Cookie | All (Status matrix guarded) | `UpdateAuditRequestStatusPayload` | `AuditRequest` | N/A (Mutation) | `['auditRequest', id]`, `['auditRequests']`, `['engagement', engagementId]` | `CONFIRMED` |
| `/api/v1/audit-requests/:id/comments` | `POST` | Cookie | All | `{ content: string }` | `AuditRequestComment` | N/A (Mutation) | `['auditRequest', id]` | `CONFIRMED` |

---

## 4. Evidentiary Documents & Uploads

| Endpoint | Method | Auth | Role | Query / Body | Response Data | TanStack Query Key | Invalidation Trigger | Status |
|---|---|---|---|---|---|---|---|---|
| `/api/v1/documents` | `GET` | Cookie | All | `engagementId`, `auditRequestId`, `classification` | `AuditDocument[]` | `['documents', params]` | N/A | `CONFIRMED` |
| `/api/v1/documents/:id` | `GET` | Cookie | All | URL `:id` | `AuditDocument` | `['document', id]` | N/A | `CONFIRMED` |
| `/api/v1/documents/upload` | `POST` | Cookie | All | `multipart/form-data` (`file`, `engagementId`, `auditRequestId`, `classification`, `comment`) | `AuditDocument` | N/A (Mutation) | `['documents']`, `['auditRequest', auditRequestId]`, `['engagement', engagementId]` | `CONFIRMED` |
| `/api/v1/documents/:id/download` | `GET` | Cookie | All | URL `:id` | `{ downloadUrl: string }` | N/A | N/A | `CONFIRMED` |
| `/api/v1/documents/:id/versions` | `GET` | Cookie | All | URL `:id` | `DocumentVersionItem[]` | `['documentVersions', id]` | N/A | `CONFIRMED` |
| `/api/v1/documents/:id` | `DELETE` | Cookie | Admin, Auditor | URL `:id` | `void` | N/A (Mutation) | `['documents']` | `CONFIRMED` |

---

## 5. Review Workpapers & Quality Assurance

| Endpoint | Method | Auth | Role | Query / Body | Response Data | TanStack Query Key | Invalidation Trigger | Status |
|---|---|---|---|---|---|---|---|---|
| `/api/v1/reviews` | `GET` | Cookie | Auditor, Manager, Admin | `status`, `search`, `page`, `limit` | `ReviewItem[]` | `['reviews', params]` | N/A | `CONFIRMED` |
| `/api/v1/reviews/:id` | `GET` | Cookie | Auditor, Manager, Admin | URL `:id` | `ReviewItem` | `['review', id]` | N/A | `CONFIRMED` |
| `/api/v1/reviews/:id/feedback` | `POST` | Cookie | Auditor, Manager, Admin | `SubmitFeedbackPayload` | `ReviewFeedback` | N/A (Mutation) | `['review', id]`, `['reviews']` | `CONFIRMED` |
| `/api/v1/reviews/:id/approve` | `POST` | Cookie | Auditor, Manager, Admin | `ReviewActionPayload` | `ReviewItem` | N/A (Mutation) | `['review', id]`, `['reviews']`, `['auditRequests']`, `['engagement', engagementId]` | `CONFIRMED` |
| `/api/v1/reviews/:id/reject` | `POST` | Cookie | Auditor, Manager, Admin | `ReviewActionPayload` | `ReviewItem` | N/A (Mutation) | `['review', id]`, `['reviews']`, `['auditRequests']`, `['engagement', engagementId]` | `CONFIRMED` |

---

## 6. Real-Time Compliance Notifications

| Endpoint | Method | Auth | Role | Query / Body | Response Data | TanStack Query Key | Invalidation Trigger | Status |
|---|---|---|---|---|---|---|---|---|
| `/api/v1/notifications` | `GET` | Cookie | All | `page`, `limit`, `unreadOnly` | `AppNotification[]` | `['notifications', params]` | N/A | `CONFIRMED` |
| `/api/v1/notifications/:id/read` | `PUT` | Cookie | All | URL `:id` | `AppNotification` | N/A (Mutation) | `['notifications']` | `CONFIRMED` |
| `/api/v1/notifications/read-all` | `PUT` | Cookie | All | None | `void` | N/A (Mutation) | `['notifications']` | `CONFIRMED` |

---

## 7. Preparedness Checklists

| Endpoint | Method | Auth | Role | Query / Body | Response Data | TanStack Query Key | Invalidation Trigger | Status |
|---|---|---|---|---|---|---|---|---|
| `/api/v1/checklists/weekly` | `GET` | Cookie | Accounting Team | `weekNumber`, `year`, `organizationId` | `Checklist` | `['checklists', 'weekly', orgId, params]` | N/A | `CONFIRMED` |
| `/api/v1/checklists/month-end` | `GET` | Cookie | Accounting Team | `engagementId`, `organizationId`, `period` | `Checklist` | `['checklists', 'month-end', orgId, params]` | N/A | `CONFIRMED` |
| `/api/v1/checklists/pre-audit` | `GET` | Cookie | Accounting Team | `engagementId`, `organizationId` | `Checklist` | `['checklists', 'pre-audit', orgId, params]` | N/A | `CONFIRMED` |
| `/api/v1/checklists/:checklistId/items/:itemId` | `PUT` | Cookie | Accounting Team | `UpdateChecklistItemPayload` | `ChecklistItem` | N/A (Mutation) | `['checklists']` | `CONFIRMED` |
| `/api/v1/checklists/:id/submit-for-review` | `POST` | Cookie | Accounting Team (Preparer) | URL `:id` | `Checklist` | N/A (Mutation) | `['checklists']` | `CONFIRMED` |
| `/api/v1/checklists/:id/sign-off` | `POST` | Cookie | Supervisor, Manager, Admin | `SignOffChecklistPayload` | `Checklist` | N/A (Mutation) | `['checklists']` | `CONFIRMED` |
| `/api/v1/checklists/:id/lock` | `POST` | Cookie | Supervisor, Manager, Admin | `SignOffChecklistPayload` | `Checklist` | N/A (Mutation) | `['checklists']` | `CONFIRMED` |

---

## 8. Authoritative Audit Trail

| Endpoint | Method | Auth | Role | Query / Body | Response Data | TanStack Query Key | Invalidation Trigger | Status |
|---|---|---|---|---|---|---|---|---|
| `/api/v1/audit-trail` | `GET` | Cookie | Auditor, Admin, Client Lead | `engagementId`, `action`, `startDate`, `endDate`, `search` | `AuditTrailRecord[]` | `['auditTrail', 'list', engagementId, params]` | N/A | `CONFIRMED` |
| `/api/v1/audit-trail/export` | `GET` | Cookie | Auditor, Admin, Client Lead | `engagementId`, `startDate`, `endDate`, `format` | Binary Blob (`application/pdf`) | N/A (Mutation) | N/A | `CONFIRMED` |

---

## 9. Asset Verification Register (Finance Module — Requirement 4)

| Endpoint | Method | Auth | Role | Query / Body | Response Data | TanStack Query Key | Invalidation Trigger | Status |
|---|---|---|---|---|---|---|---|---|
| `/api/v1/assets` | `GET` | Cookie | Accounting Team, Client Lead | `category`, `status`, `search`, `page`, `limit` | `AssetRecord[]` | `['assets', params]` | N/A | `PENDING_BACKEND` |
| `/api/v1/assets` | `POST` | Cookie | Accounting Team, Client Lead | `CreateAssetPayload` | `AssetRecord` | N/A (Mutation) | `['assets']` | `PENDING_BACKEND` |
| `/api/v1/assets/:id` | `GET` | Cookie | Accounting Team, Authorized Auditor | URL `:id` | `AssetRecord` | `['asset', id]` | N/A | `PENDING_BACKEND` |
| `/api/v1/assets/:id/verify` | `PUT` | Cookie | Accounting Team, Client Lead | `VerifyAssetPayload` | `AssetRecord` | N/A (Mutation) | `['assets']`, `['asset', id]` | `PENDING_BACKEND` |
| `/api/v1/assets/access-requests` | `POST` | Cookie | Auditor, Audit Manager | `RequestAssetAccessPayload` | `AssetAccessRequest` | N/A (Mutation) | N/A | `PENDING_BACKEND` |

---

## 10. Audit Communication & Meeting Centre (Secure Communication & In-App Meetings)

| Endpoint | Method | Auth | Role | Query / Body | Response Data | TanStack Query Key | Invalidation Trigger | Status |
|---|---|---|---|---|---|---|---|---|
| `/api/v1/communication/conversations` | `GET` | Cookie | All (isolated by engagement) | `engagementId` | `Conversation[]` | `['communication', 'conversations', engagementId]` | N/A | `PENDING_BACKEND` |
| `/api/v1/communication/conversations/:id` | `GET` | Cookie | Authorized Participants | URL `:id` | `Conversation` | `['communication', 'conversation', id]` | N/A | `PENDING_BACKEND` |
| `/api/v1/communication/conversations/:id/messages` | `GET` | Cookie | Authorized Participants | URL `:id`, `limit`, `before` | `ChatMessage[]` | `['communication', 'messages', id]` | N/A | `PENDING_BACKEND` |
| `/api/v1/communication/conversations/:id/messages` | `POST` | Cookie | Authorized Participants | `SendMessagePayload` | `ChatMessage` | N/A (Mutation) | `['communication', 'messages', id]`, `['communication', 'conversations']` | `PENDING_BACKEND` |
| `/api/v1/communication/meetings` | `GET` | Cookie | All (isolated by engagement) | `engagementId` | `AuditMeeting[]` | `['communication', 'meetings', engagementId]` | N/A | `PENDING_BACKEND` |
| `/api/v1/communication/meetings` | `POST` | Cookie | Authorized Participants | `ScheduleMeetingPayload` | `AuditMeeting` | N/A (Mutation) | `['communication', 'meetings']` | `PENDING_BACKEND` |
| `/api/v1/communication/meetings/:id` | `GET` | Cookie | Authorized Participants | URL `:id` | `AuditMeeting` | `['communication', 'meeting', id]` | N/A | `PENDING_BACKEND` |
| `/api/v1/communication/meetings/:id/consent` | `POST` | Cookie | Invited Participants | `SubmitConsentPayload` | `AuditMeeting` | N/A (Mutation) | `['communication', 'meeting', id]`, `['communication', 'meetings']` | `PENDING_BACKEND` |
| `/api/v1/communication/meetings/:id/join` | `POST` | Cookie | Authorized Participants | URL `:id` | `{ token: string, roomUrl: string }` | N/A (Mutation) | N/A | `PENDING_BACKEND` |
| `/api/v1/communication/recordings` | `GET` | Cookie | Authorized Participants | `engagementId`, `conversationId` | `MeetingRecording[]` | `['communication', 'recordings', params]` | N/A | `PENDING_BACKEND` |
| `/api/v1/communication/recordings/:id` | `GET` | Cookie | Authorized Participants | URL `:id` | `MeetingRecording` | `['communication', 'recording', id]` | N/A | `PENDING_BACKEND` |
| `/api/v1/communication/recordings/:id/stream` | `GET` | Cookie | Authorized Participants | URL `:id` | `{ streamUrl: string, expiresAt: string }` | N/A | N/A | `PENDING_BACKEND` |
| `/api/v1/communication/meeting-provider` | `GET` | Cookie | All | None | `MeetingProviderStatus` | `['communication', 'providerStatus']` | N/A | `PENDING_BACKEND` |

### Infrastructure & Provider Requirements (Awaiting Implementation)
1. **Server-Side Video Gateway**: Enterprise WebRTC SFU (LiveKit / Janus) or Server-to-Server OAuth provider gateway (Zoom / Google Meet).
2. **Server-Side Recording Pipeline**: Automated video/audio ingest pipeline writing to WORM-compliant cloud object storage with SHA-256 evidence checksum generation.
3. **Mandatory Recording Consent Ledger**: Cryptographic signature or database recording of affirmative participant consent before recording pipeline starts.
4. **WebSocket/SSE Real-Time Gateway**: Authenticated bidirectional connection for immediate message dispatch without client polling.

---

## 11. Integration Matrix Summary

| Area | Endpoints | Confirmed | Needs Confirmation | Integration Readiness |
|---|---|---|---|---|
| **Authentication & 2FA** | 9 | 9 | 0 | **100% Ready** |
| **Engagements** | 6 | 6 | 0 | **100% Ready** |
| **Audit Requests (PBC)** | 5 | 5 | 0 | **100% Ready** |
| **Evidentiary Documents** | 6 | 6 | 0 | **100% Ready** |
| **Review Workpapers** | 5 | 5 | 0 | **100% Ready** |
| **Notifications** | 3 | 3 | 0 | **100% Ready** |
| **Checklists** | 7 | 7 | 0 | **100% Ready** |
| **Audit Trail & Export** | 2 | 2 | 0 | **100% Ready** |
| **Asset Verification (Finance)** | 5 | 0 | 5 | **Awaiting Backend Deployment** |
| **Communication & Meetings** | 13 | 0 | 13 | **Frontend Complete; Backend & Video Infra Pending** |
| **Total** | **61** | **43** | **18** | **Frontend Complete; 18 Backend Endpoints & Video Infra Pending** |


