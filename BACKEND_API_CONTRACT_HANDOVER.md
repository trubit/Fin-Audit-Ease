# FinAuditEase — Backend API Contract & Integration Handover Guide

**Company:** Sabi Africa Innovations Limited  
**Project:** FinAuditEase  
**Scope:** Complete Backend Integration Specifications & API Endpoints Contract

---

## 1. Executive Summary

This document specifies the complete API integration contract for the FinAuditEase platform.
All dummy data, fabricated seed records, and mock business entities have been permanently removed from the production frontend. The frontend is built strictly around the canonical API endpoints defined in `src/services/api/endpoints.ts`.

When backend endpoints are returning fresh or empty database tables (`[]` or `null`), the frontend displays honest, accessible empty states (e.g., *"No audit records available yet."*). When requests fail, honest error states with retry mechanisms are rendered.

---

## 2. Core API Endpoint Specifications

All endpoints are prefixed with `/api/v1`.

### 2.1 Authentication & Session
| Method | Endpoint | Description | Request Payload | Response Data |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | User login (returns JWT + refresh cookie) | `{ email, password }` | `{ token, refreshToken, user }` |
| `POST` | `/api/v1/auth/register` | User self-registration | `{ fullName, email, password, role, ... }` | `{ token, user }` |
| `POST` | `/api/v1/auth/logout` | Session invalidation | — | `{ success: true }` |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | — | `UserProfile` |
| `POST` | `/api/v1/auth/refresh` | Rotate JWT token | `{ refreshToken }` | `{ token }` |
| `GET` | `/api/v1/auth/invitations/:token` | Validate engagement invitation token | — | `InvitationDetails` |
| `POST` | `/api/v1/auth/invitations/accept` | Accept invitation & activate account | `{ token, fullName, password }` | `{ token, user }` |

### 2.2 Audit Engagements
| Method | Endpoint | Description | Query / Payload | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/engagements` | List authorized audit engagements | `status`, `search`, `page`, `limit` | `Engagement[]` |
| `POST` | `/api/v1/engagements` | Create audit engagement workspace | `CreateEngagementPayload` | `Engagement` |
| `GET` | `/api/v1/engagements/:id` | Get engagement details | — | `Engagement` |
| `PATCH` | `/api/v1/engagements/:id` | Update engagement metadata or lead auditor | `Partial<Engagement>` | `Engagement` |
| `GET` | `/api/v1/engagements/:id/milestones` | Scheduled engagement milestones | — | `EngagementMilestone[]` |
| `GET` | `/api/v1/engagements/:id/members` | Team members (accounting + audit) | — | `EngagementMember[]` |
| `POST` | `/api/v1/engagements/:id/invitations` | Invite team member to engagement | `{ email, role }` | `{ message, invitationToken }` |

### 2.3 Provided-By-Client (PBC) Audit Requests
| Method | Endpoint | Description | Query / Payload | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/audit-requests` | List audit requests | `engagementId`, `status`, `priority` | `AuditRequest[]` |
| `POST` | `/api/v1/audit-requests` | Create PBC audit request | `CreateAuditRequestPayload` | `AuditRequest` |
| `GET` | `/api/v1/audit-requests/:id` | Single audit request details | — | `AuditRequest` |
| `PATCH` | `/api/v1/audit-requests/:id` | Update title, priority, assignee | `Partial<CreateAuditRequestPayload>` | `AuditRequest` |
| `PATCH` | `/api/v1/audit-requests/:id/status` | Transition status (`SUBMITTED`, `IN_REVIEW`, `ACCEPTED`, `REJECTED`) | `{ status, comment? }` | `AuditRequest` |
| `POST` | `/api/v1/audit-requests/:id/comments` | Post comment on request | `{ content }` | `AuditRequestComment` |

### 2.4 Evidentiary Documents & Repository
| Method | Endpoint | Description | Query / Payload | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/documents` | List uploaded/verified documents | `engagementId`, `auditRequestId`, `classification` | `AuditDocument[]` |
| `POST` | `/api/v1/documents/upload` | Multipart file upload | `FormData: file, engagementId, classification, comment` | `AuditDocument` |
| `GET` | `/api/v1/documents/:id` | Document metadata | — | `AuditDocument` |
| `GET` | `/api/v1/documents/:id/download` | Secure pre-signed download URL | — | `{ downloadUrl }` |
| `GET` | `/api/v1/documents/:id/versions` | Immutable version history | — | `DocumentVersionItem[]` |

### 2.5 Operational Checklists (Finance Module)
| Method | Endpoint | Description | Response Data |
|---|---|---|---|
| `GET` | `/api/v1/checklists/weekly` | Active weekly checkpoint checklist | `Checklist \| null` |
| `GET` | `/api/v1/checklists/month-end` | Active month-end close checklist | `Checklist \| null` |
| `GET` | `/api/v1/checklists/pre-audit` | Active pre-audit readiness checklist | `Checklist \| null` |
| `PUT` | `/api/v1/checklists/:cId/items/:iId` | Update item status, notes, evidence attachments | `ChecklistItem` |
| `POST` | `/api/v1/checklists/:cId/submit-review` | Submit completed period for supervisor review | `Checklist` |
| `POST` | `/api/v1/checklists/:cId/sign-off` | Supervisor / Manager sign-off | `Checklist` |
| `POST` | `/api/v1/checklists/:cId/lock` | Permanent immutable period lock | `Checklist` |

### 2.6 Audit Communication & Meeting Centre
| Method | Endpoint | Description | Response Data |
|---|---|---|---|
| `GET` | `/api/v1/communication/conversations` | User conversations (Group & 1-on-1) | `Conversation[]` |
| `GET` | `/api/v1/communication/conversations/:id` | Conversation metadata & participant list | `Conversation` |
| `GET` | `/api/v1/communication/conversations/:id/messages` | Historical chat messages | `ChatMessage[]` |
| `POST` | `/api/v1/communication/conversations/:id/messages` | Send message with attachments | `ChatMessage` |
| `GET` | `/api/v1/communication/meetings` | Scheduled audit walkthrough meetings | `AuditMeeting[]` |
| `POST` | `/api/v1/communication/meetings` | Schedule walkthrough meeting | `AuditMeeting` |
| `POST` | `/api/v1/communication/meetings/:id/consent` | Participant recording consent record | `AuditMeeting` |
| `GET` | `/api/v1/communication/recordings` | Immutable recorded walkthrough sessions | `MeetingRecording[]` |
| `GET` | `/api/v1/communication/meeting-provider` | Video meeting gateway health check | `MeetingProviderStatus` |

### 2.7 Asset Verification Register
| Method | Endpoint | Description | Response Data |
|---|---|---|---|
| `GET` | `/api/v1/assets` | Fixed asset register records | `AssetRecord[]` |
| `POST` | `/api/v1/assets` | Register new fixed asset | `AssetRecord` |
| `PUT` | `/api/v1/assets/:id/verify` | Record physical verification count & variance | `AssetRecord` |
| `POST` | `/api/v1/assets/access-requests` | Auditor access request | `AssetAccessRequestResponse` |

### 2.8 Administration Platform
| Method | Endpoint | Description | Response Data |
|---|---|---|---|
| `POST` | `/api/v1/admin/auth/login` | Admin portal credential authentication | `{ token, adminUser }` |
| `POST` | `/api/v1/admin/auth/2fa/verify` | Admin portal mandatory MFA verification | `{ token, adminUser }` |
| `GET` | `/api/v1/admin/dashboard/kpis` | Cross-platform operational KPIs | `AdminDashboardKpis` |
| `GET` | `/api/v1/admin/users` | Platform user directory across all 6 application roles | `AdminUserRecord[]` |
| `PATCH` | `/api/v1/admin/users/:id/role` | Update user role assignment | `AdminUserRecord` |
| `GET` | `/api/v1/admin/organisations` | Registered client & audit organizations | `AdminOrgRecord[]` |
| `GET` | `/api/v1/admin/auditors` | Registered and verified audit practitioners | `AdminAuditorRecord[]` |
| `GET` | `/api/v1/admin/audit-managers` | Registered audit managers & assurance engagement managers | `AdminAuditorRecord[]` |
| `GET` | `/api/v1/admin/accounting-managers` | Registered accounting managers & client SME leads | `AdminUserRecord[]` |
| `GET` | `/api/v1/admin/roles` | List all 6 application roles and capability matrix | `ApplicationRoleDefinition[]` |
| `PATCH` | `/api/v1/admin/roles/:role/permissions` | Update capability rule for a specific role | `CapabilityRule` |
| `GET` | `/api/v1/admin/subscriptions` | Subscription plans and seat limits | `AdminSubscriptionRecord[]` |
| `GET` | `/api/v1/admin/audit-trail` | Immutable system event log | `AuditTrailEvent[]` |
| `GET` | `/api/v1/admin/operations/monitoring` | Unified cross-role activity and operational stream | `CrossRoleActivity[]` |

---

## 3. Frontend Error Handling & Empty-State Behavior

- **HTTP 404 / 501:** The frontend gracefully treats un-provisioned endpoints as fresh / empty collections (`[]` or `null`) displaying truthful empty states rather than throwing raw unhandled exceptions.
- **HTTP 401 / 403:** Handled automatically by `apiClient.ts` interceptors to redirect unauthorized sessions to login.
- **HTTP 500 / Network Disconnect:** Renders accessible error cards with retry buttons allowing users to re-fetch when connectivity recovers.

