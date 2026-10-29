# FinAuditEase — Backend Engineering Handoff & Security Obligations (Phase 17)

## Executive Overview

This document specifies the authoritative backend security, architecture, and operational requirements that the backend engineering team (owned by Emmanuel / Backend Team) must implement and enforce.

Per the architectural boundaries of FinAuditEase:
* **The frontend cannot and does not enforce backend security invariants.**
* Frontend form validation, file size checks, role guards, and sanitization are strictly **client-side user experience conveniences**.
* The authoritative security and business rules must be independently validated and enforced by the backend on every HTTP request.

---

## 1. Authentication & Session Cookie Architecture

### 1.1 Session Storage & Cookies
- **Protocol**: Cookie-based session management (`credentials: 'include'`).
- **Flags Required**:
  - `HttpOnly`: MUST be `true` on all session and refresh cookies to prevent JavaScript/XSS extraction.
  - `Secure`: MUST be `true` in staging and production (enforcing HTTPS transmission only).
  - `SameSite`: MUST be set to `Lax` or `Strict` to prevent Cross-Site Request Forgery (CSRF).
  - `Domain` & `Path`: Scoped strictly to the API domain/path.
- **Zero Frontend Storage**:
  - The frontend stores ZERO JWTs, passwords, or authentication secrets in `localStorage` or `sessionStorage`.
  - The backend must not return raw persistent access tokens in response bodies for client storage.

### 1.2 Two-Factor Authentication (2FA) Enforcement
- When a user logs in with valid email/password:
  - If 2FA is required, the backend returns `{ requires2FA: true, temporaryToken: "..." }`.
  - The temporary token must have a short lifespan (e.g., 5 minutes), be single-use, and be cryptographically tied to the pending user ID.
  - The backend must NOT issue an authenticated session cookie until the 6-digit 2FA code is verified at `POST /api/v1/auth/2fa/verify`.
  - Rate limiting must strictly lock 2FA verification after 5 consecutive incorrect attempts to prevent brute-force attacks.

### 1.3 Session Inactivity & Revocation
- Inactivity Timeout: 30 minutes.
- The frontend enforces a client-side timer with a 2-minute warning modal, but the **backend must enforce server-side session expiry**.
- On `POST /api/v1/auth/logout`, the backend must immediately revoke the session in the database/session store (e.g. Redis) and clear all auth cookies with `Max-Age=0`.

---

## 2. Multi-Tenant Authorization & IDOR Prevention

### 2.1 Engagement Isolation
- Every request to `/api/v1/engagements/:id`, `/api/v1/audit-requests/:id`, `/api/v1/documents/:id`, and `/api/v1/reviews/:id` must verify that the authenticated user belongs to the associated organization or engagement member list.
- **Insecure Direct Object Reference (IDOR) Mitigation**:
  - A user possessing a valid session must receive `403 Forbidden` or `404 Not Found` if querying or modifying an entity that belongs to another tenant or engagement.
  - Never trust client-supplied `organizationId` or `firmId` in payload bodies; derive tenant scope strictly from the verified session identity.

### 2.2 Role-Based Access Control (RBAC)
- **Auditor Roles** (`AUDITOR`, `AUDIT_MANAGER`):
  - Authorized to create engagements, create audit requests, write private review notes, and approve/reject submissions.
- **Accounting Team Roles** (`ACCOUNTING_MEMBER`, `CLIENT_LEAD` / internal `FINANCE_USER`):
  - Authorized to upload requested documents, respond to audit requests, resubmit rejected items, and manage Month-End/Pre-Audit checklists.
  - Strictly **FORBIDDEN** from viewing private auditor notes (`review.privateNotes`) or triggering approval/rejection endpoints (`POST /reviews/:id/approve`, `POST /reviews/:id/reject`).

---

## 3. Evidentiary Document Storage & Content Security

### 3.1 Server-Side MIME & Magic Byte Validation
- The frontend validates file extensions (`.pdf`, `.xlsx`, `.xls`, `.csv`, `.docx`, `.doc`, `.jpg`, `.jpeg`, `.png`) and enforces a 25MB limit.
- **Backend Invariant**:
  - The backend MUST inspect the actual file header bytes (magic numbers) to verify the real MIME type before accepting the file into storage.
  - Never trust the client-supplied `Content-Type` header or file extension.
  - Scan uploaded files for malware and macros before persisting.

### 3.2 Storage Security & Presigned URLs
- Files must be stored in private, non-public cloud buckets (e.g., AWS S3, Cloudflare R2, Google Cloud Storage).
- Document downloads and previews (`/api/v1/documents/:id/download`) must either stream through an authenticated backend proxy or return a short-lived (e.g. 60 seconds) cryptographically signed URL.
- Public bucket URLs are strictly prohibited.

---

## 4. Immutable Audit Trail & Regulatory Compliance

### 4.1 Append-Only Audit Trail
- The audit trail (`GET /api/v1/audit-trail`) records:
  - Engagement creation and milestone transitions
  - Audit request publication, assignment, response, and resubmission
  - Document uploads, version replacements, viewings, and downloads
  - Review decisions (approvals and rejections with mandatory reasons)
- **Immutability Guarantee**:
  - The database table for audit trail records must be strictly **append-only**.
  - `UPDATE` and `DELETE` operations on audit trail tables must be blocked at the database engine or trigger level.
  - Every entry must record: `id`, `engagementId`, `action`, `actorId`, `actorName`, `actorRole`, `timestamp`, `ipAddress`, and `metadata`.

### 4.2 PDF Export Service
- `GET /api/v1/audit-trail/export?format=pdf` must generate a tamper-evident, formatted compliance PDF on the server and stream it as `application/pdf`.

---

## 5. Notification Engine & Background Reminders

### 5.1 Real-Time & Event Notifications
- The frontend queries `/api/v1/notifications` for the logged-in user.
- The backend is responsible for creating notifications upon business events:
  - New audit request assigned
  - Document submitted for review
  - Submission rejected with required correction reason
  - Submission approved
  - Pre-audit / Month-end milestone nearing deadline

### 5.2 Automated Reminders
- The frontend does NOT run background cron jobs or synthetic reminder timers.
- The backend must operate an automated reminder engine (e.g. BullMQ, Cron, or Celery) to send email/in-app reminders for upcoming or overdue deadlines.

---

## 6. Server-Side Data Validation & Error Sanitization

### 6.1 Schema Validation Parity
- The backend must validate all request payloads against strict server-side schemas matching the frontend Zod schemas:
  - Full Name: 2–100 characters, no dangerous control characters
  - Password: Min 8 characters, with uppercase, lowercase, number, and special character
  - Email: Valid RFC 5322 format
  - ICAN / ANAN Membership Number: Required for auditor registration
  - Rejection Reason: Mandatory and non-empty when rejecting a submission
  - Document files: Max 25MB, supported MIME types

### 6.2 Production Error Sanitization
- In production environments:
  - Never leak database stack traces, SQL syntax errors, internal file paths, or ORM exception dumps to the client.
  - Return normalized JSON errors matching the contract:
    ```json
    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Human readable user-safe message",
        "details": [
          { "field": "password", "message": "Password must contain a special character." }
        ]
      }
    }
    ```

---

## 7. Infrastructure, Monitoring & Operations

| Requirement | Specification |
|---|---|
| **HTTPS / TLS** | TLS 1.3 mandatory across all endpoints in staging and production. |
| **CORS Policy** | Whitelist only approved frontend origins (e.g. `https://app.finauditease.ng`). Reject `*` wildcard when credentials are included. |
| **Rate Limiting** | Strict rate limiting on `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/2fa/*`, `/api/v1/auth/forgot-password`. |
| **Database Backups** | Automated daily encrypted snapshots with Point-In-Time Recovery (PITR) for PostgreSQL. |
| **Health Check** | Dedicated endpoint `/health` or `/api/health` returning database and Redis connectivity status. |
| **Logging & APM** | Structured JSON logging with request IDs (`X-Request-ID`) correlated across frontend and backend. |

---

## 8. Asset Verification Register & Auditor Access Authorization (Requirement 4)

### 8.1 Finance Module Asset Register & Invariants
- **Scope**: Exclusive operational register for the Accounting Team to reconcile and verify Fixed and Current assets.
- **Endpoints Required**:
  - `GET /api/v1/assets`: Retrieve verified and unverified assets scoped strictly to the authenticated organization. Filterable by `category` (`FIXED` | `CURRENT`), `status` (`UNVERIFIED` | `VERIFIED` | `DISCREPANCY` | `UNDER_REVIEW`), and `search`.
  - `POST /api/v1/assets`: Register newly capitalized assets. Request payload must validate `name`, `assetTag`, `category`, `assetType`, `bookValue` (positive number), `currency` (e.g. `NGN`), `acquisitionDate`, `location`, `assignedCustodian`, and `documentationFileId`.
  - `GET /api/v1/assets/:id`: Detailed audit history of asset acquisition and past verifications.
  - `PUT /api/v1/assets/:id/verify`: Physical verification submission by Accounting Team. Server must independently calculate and record `discrepancy = physicalBalance - bookValue`. Automatically flag status as `DISCREPANCY` if non-zero variance exists, or `VERIFIED` if variance is zero. Must enforce mandatory `comments` when variance is detected.

### 8.2 Auditor Access Request Workflow & Security Boundaries
- **Auditor Access Boundary**:
  - External auditors (`AUDITOR`, `AUDIT_MANAGER`) do **NOT** have unilateral access to view or inspect internal finance asset registers.
  - The backend must enforce `403 Forbidden` if an auditor attempts to query `/api/v1/assets` without an active, approved delegation or access request.
- **Access Request Protocol (`POST /api/v1/assets/access-requests`)**:
  - Auditors submit an access request payload: `{ purpose: string, engagementId: string, requestedCategories?: AssetCategory[] }`.
  - **No Simulated Auto-Grants**: The backend MUST record the access request in a `PENDING` state. Under no circumstances should access be automatically granted.
  - Approval must be explicitly confirmed by an authorized Accounting Team Lead (`CLIENT_LEAD`) or Organization Admin.
- **Zero Mock / Fake Data Guarantee**:
  - If the database table or service for assets is unprovisioned, the backend must return a genuine empty array `{ success: true, data: [] }` or a clean `501 Not Implemented` / `404 Not Found` response. The backend must NEVER fabricate fake or synthetic asset rows.

---

## 9. Weekly Checklist, Month-End Close & Period Locking Invariants

### 9.1 Required Endpoints
- `GET /api/v1/checklists/weekly`: Returns authoritative weekly checklist for the requested reporting week (`weekNumber`, `year`).
- `POST /api/v1/checklists/weekly/:id/submit-for-review`: Submits prepared weekly checkpoints for supervisor review.
- `POST /api/v1/checklists/weekly/:id/sign-off`: Records supervisor review sign-off and period lock.
- `GET /api/v1/checklists/month-end`: Returns 21 sequential month-end close items across Categories A–F, including Annual PAYE Return.
- `POST /api/v1/checklists/month-end/:id/submit-for-review`: Submits completed month-end schedules for review.
- `POST /api/v1/checklists/month-end/:id/sign-off`: Records manager sign-off.
- `POST /api/v1/checklists/month-end/:id/lock`: Permanently locks general ledger period and checklist records.
- `PUT /api/v1/checklists/:id/items/:itemId`: Updates checklist item status, notes, difference explanations, internal target date, and mandatory N/A reasons.

### 9.2 Separation of Duties Enforcement
- **Preparer vs Reviewer Separation**:
  - The preparer who marks checklist items Done CANNOT be the same user who signs off or reviews the period.
  - The backend MUST validate that `reviewerId !== preparerId`.
  - Non-manager users attempting to invoke review/sign-off endpoints must receive `403 Forbidden`.

### 9.3 Statutory Deadlines vs Internal Target Dates
- **Statutory Deadlines are Legally Fixed**:
  - PAYE: 10th of following month.
  - VAT: 21st of following month.
  - WHT: 21st of following month.
  - Annual PAYE: 31st January of following year.
  - The backend MUST NOT shift statutory deadlines because of weekends or public holidays.
- **Configurable Internal Target Date ("Complete by")**:
  - Teams may configure an earlier internal target date (e.g. preceding Friday if statutory date is Sunday).
  - Changing an internal target date MUST NOT alter or overwrite the statutory deadline.
- **Overdue Invariant**:
  - An item is ONLY overdue after its statutory deadline has passed in the company's official timezone.
  - An internal target date passing does NOT make an item overdue; it only generates an internal target passed indicator.

### 9.4 Mandatory Not Applicable (N/A) Reason
- Marking any item `NOT_APPLICABLE` requires a non-empty, meaningful justification explaining why the procedure does not apply to the entity.
- The backend must reject N/A submissions with missing or whitespace-only reasons.

### 9.5 Period Locking & Carry-Over
- Locking a period permanently disables editing controls and prevents backdated ledger postings.
- Corrections after locking require an authorized, audited correction flow.
- Unresolved items carried forward into subsequent periods must preserve their origin period, carry-over reason, and audit lineage.


