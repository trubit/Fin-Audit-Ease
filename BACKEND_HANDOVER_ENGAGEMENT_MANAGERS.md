# FinAuditEase Engagement Manager Roles — Backend Developer Implementation Handover
**Document:** `BACKEND_HANDOVER_ENGAGEMENT_MANAGERS.md`  
**Phase:** 18  
**Date:** 22 November 2026  
**Audience:** Backend Engineering Team  
**Integration Boundary:** Defined by `src/services/api/endpoints.ts`  

---

## 1. Architectural Integration Overview

The FinAuditEase frontend application routes all backend communication through a centralized HTTP client (`apiClient`) with automatic CSRF token inclusion, credentials (`credentials: 'include'`), and cookie-based session verification.

```
Frontend UI ──► Service Function ──► Central Endpoint Path ──► apiClient ──► Backend Controller
```

---

## 2. Comprehensive Workflow Matrix (15 Attributes)

### Workflow 1: Assign / Reassign Lead Auditor to Engagement

1. **Role:** `AUDIT_MANAGER` (or `ADMIN`)
2. **Frontend Page:** `EngagementDetailPage.tsx` (`/engagements/:id`)
3. **Frontend Component:** `AssignFieldAuditorModal`
4. **User Action:** Clicks "Assign Field Auditor", enters auditor name, and clicks "Confirm Assignment".
5. **API Endpoint:** `API_ENDPOINTS.ENGAGEMENTS.UPDATE(id)` ➔ `/api/v1/engagements/{id}`
6. **API Service Function:** `engagementService.assignAuditor(id, { auditorId, auditorName })`
7. **HTTP Method:** `PATCH`
8. **Request Payload:**
   ```json
   {
     "leadAuditorId": "usr_auditor_01",
     "leadAuditorName": "Dr. Ibrahim Babatunde, FCA"
   }
   ```
9. **Expected Response Structure:**
   ```json
   {
     "success": true,
     "data": {
       "id": "eng_001",
       "title": "Statutory Financial Audit 2026",
       "leadAuditorId": "usr_auditor_01",
       "leadAuditorName": "Dr. Ibrahim Babatunde, FCA",
       "status": "ACTIVE",
       "updatedAt": "2026-11-22T20:00:00.000Z"
     }
   }
   ```
10. **Required Permissions:** `audit_manager:assign_auditor` or `org_role:AUDIT_MANAGER`
11. **Backend Business Operation:** Updates the assigned lead auditor on the engagement record, verifies ICAN/FRC status, and records an immutable audit trail entry (`ENGAGEMENT_AUDITOR_ASSIGNED`).
12. **Database Responsibility:** `engagements.lead_auditor_id`, `engagements.lead_auditor_name`, `audit_trail_events` table.
13. **Validation Requirements:** `leadAuditorName` non-empty string; `leadAuditorId` valid UUID or user reference; engagement must exist and belong to the manager's firm.
14. **Expected Error Responses:**
    - `400 Bad Request`: Validation failure (empty auditor name).
    - `401 Unauthorized`: Missing or expired session.
    - `403 Forbidden`: User does not hold `AUDIT_MANAGER` or `ADMIN` role.
    - `404 Not Found`: Engagement ID does not exist.
15. **Current Implementation Status:** Frontend implemented & wired; backend endpoint contract verified.

---

### Workflow 2: Assign Audit Request (PBC) to Corporate Accounting SME

1. **Role:** `ACCOUNTING_MANAGER` (or `AUDIT_MANAGER`, `ADMIN`)
2. **Frontend Page:** `AuditRequestDetailPage.tsx` (`/audit-requests/:id`)
3. **Frontend Component:** `AssignRequestModal`
4. **User Action:** Clicks "(Reassign)" link on Assignee field, enters SME name, and clicks "Confirm Assignment".
5. **API Endpoint:** `API_ENDPOINTS.AUDIT_REQUESTS.UPDATE(id)` ➔ `/api/v1/audit-requests/{id}`
6. **API Service Function:** `auditRequestService.assignAuditRequest(id, { assigneeId, assigneeName })`
7. **HTTP Method:** `PATCH`
8. **Request Payload:**
   ```json
   {
     "assigneeId": "usr_sme_002",
     "assigneeName": "Chidinma Okafor"
   }
   ```
9. **Expected Response Structure:**
   ```json
   {
     "success": true,
     "data": {
       "id": "req_001",
       "referenceCode": "REQ-2026-001",
       "title": "Bank Reconciliation Statements Q3",
       "assigneeId": "usr_sme_002",
       "assigneeName": "Chidinma Okafor",
       "status": "OPEN",
       "updatedAt": "2026-11-22T20:00:00.000Z"
     }
   }
   ```
10. **Required Permissions:** `accounting_manager:assign_request` or `audit_manager:assign_request`
11. **Backend Business Operation:** Sets internal assignee for the request, issues notification dispatch to assignee, and logs event `REQUEST_ASSIGNED`.
12. **Database Responsibility:** `audit_requests.assignee_id`, `audit_requests.assignee_name`, `notifications` table.
13. **Validation Requirements:** `assigneeName` non-empty; `id` corresponds to valid request.
14. **Expected Error Responses:**
    - `400 Bad Request`: Invalid payload.
    - `403 Forbidden`: User lacks permission to manage engagement requests.
    - `404 Not Found`: Request ID not found.
15. **Current Implementation Status:** Frontend implemented & wired; backend endpoint contract verified.

---

### Workflow 3: Quality Control Review Approval / Rejection by Audit Manager

1. **Role:** `AUDIT_MANAGER` (or `AUDITOR`)
2. **Frontend Page:** `ReviewDetailPage.tsx` (`/review/:id`) or `AuditRequestDetailPage.tsx`
3. **Frontend Component:** `ReviewActionModal`
4. **User Action:** Enters supervisory review notes, selects "Approve" or "Reject / Request Corrections", and submits.
5. **API Endpoint:** `API_ENDPOINTS.REVIEWS.APPROVE(id)` or `API_ENDPOINTS.REVIEWS.REJECT(id)`
6. **API Service Function:** `reviewService.approveReview(id, notes)` / `reviewService.rejectReview(id, notes)`
7. **HTTP Method:** `POST`
8. **Request Payload:**
   ```json
   {
     "feedback": "Confirmed bank confirmation letter matches general ledger balance.",
     "decision": "APPROVED"
   }
   ```
9. **Expected Response Structure:**
   ```json
   {
     "success": true,
     "data": {
       "id": "rev_001",
       "status": "APPROVED",
       "reviewedBy": "Victoria Okonkwo, ACA",
       "reviewedAt": "2026-11-22T20:00:00.000Z"
     }
   }
   ```
10. **Required Permissions:** `audit:review_evidence` (`AUDIT_MANAGER`, `AUDITOR`)
11. **Backend Business Operation:** Updates review status, marks audit request as `ACCEPTED` or `REJECTED`, creates timeline record.
12. **Database Responsibility:** `reviews`, `audit_requests`, `audit_trail_events`.
13. **Validation Requirements:** Non-empty feedback on rejection; valid review ID.
14. **Expected Error Responses:** `400 Bad Request`, `403 Forbidden`, `404 Not Found`.
15. **Current Implementation Status:** Implemented and verified.

---

### Workflow 4: Month-End Close Supervisory Sign-Off & Period Lock

1. **Role:** `ACCOUNTING_MANAGER` (or `ADMIN`)
2. **Frontend Page:** `MonthEndPage.tsx` (`/month-end`)
3. **Frontend Component:** `PeriodLockModal`
4. **User Action:** Clicks "Lock & Sign-Off Period", inputs manager confirmation, and signs off.
5. **API Endpoint:** `API_ENDPOINTS.CHECKLISTS.LOCK(checklistId)` ➔ `/api/v1/checklists/{checklistId}/lock`
6. **API Service Function:** `checklistService.lockPeriod(checklistId)`
7. **HTTP Method:** `POST`
8. **Request Payload:**
   ```json
   {
     "period": "2026-10",
     "signOffNotes": "All 22 canonical close controls verified across Cash, Receivables, Payables, and Statutory Tax."
   }
   ```
9. **Expected Response Structure:**
   ```json
   {
     "success": true,
     "data": {
       "id": "checklist_month_2026_10",
       "isLocked": true,
       "lockedBy": "Femi Adeleke, FCA",
       "lockedAt": "2026-11-22T20:00:00.000Z"
     }
   }
   ```
10. **Required Permissions:** `accounting:lock_period` (`ACCOUNTING_MANAGER`, `ADMIN`)
11. **Backend Business Operation:** Locks all accounting checklist items for the period, prevents further preparer edits without manager override.
12. **Database Responsibility:** `checklists.is_locked`, `checklists.locked_by`, `audit_trail_events`.
13. **Validation Requirements:** All mandatory checklist items must be in `COMPLETED` or `REVIEWED` status.
14. **Expected Error Responses:** `400 Bad Request` (incomplete items), `403 Forbidden`.
15. **Current Implementation Status:** Implemented and verified.

---

### 3. Verification Checklist for Backend Engineers

- [ ] Ensure database migrations include `role` enum with `'ACCOUNTING_MANAGER'` and `'AUDIT_MANAGER'`.
- [ ] Enforce tenant data isolation: Audit Managers only see engagements belonging to their audit firm organization; Accounting Managers only see records for their client entity.
- [ ] Ensure `PATCH /api/v1/engagements/{id}` updates `lead_auditor_id` and `lead_auditor_name`.
- [ ] Ensure `PATCH /api/v1/audit-requests/{id}` updates `assignee_id` and `assignee_name`.

