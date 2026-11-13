# FinAuditEase Admin Platform — Design Specification
**Company:** Sabi Africa Innovations Limited  
**Official Branding:** FinAuditEase, powered by Sabi Africa Innovations Limited  
**Phase:** Phase 18 — Enterprise Administrator Platform  
**Target Viewports:** Desktop (1440px+), Tablet (768px – 1024px), Mobile (375px – 480px)  
**Status:** Approved for Implementation  

---

## 1. Visual Brand Identity & Color System

FinAuditEase strictly adheres to the official design system of **Sabi Africa Innovations Limited**:

| Token Name | Hex Code | Visual Application | Contrast Ratio (WCAG AAA) |
| :--- | :--- | :--- | :--- |
| `--green-deep` / `--brand-green-800` | `#1a6b4a` | Primary buttons, active nav pills, authoritative headers | 5.8:1 against `#ffffff` |
| `--green-mid` / `--brand-green-500` | `#2d9b68` | Focus borders, hover states, success badges | 3.4:1 against `#ffffff` |
| `--green-light` / `--brand-green-50` | `#e8f5ee` | Active nav background, badge pill background, card accents | 14.2:1 against `#1a6b4a` |
| `--green-accent` / `--brand-green-400`| `#3dbe80` | Live indicator status dots, metric delta arrows | High visibility |
| `--brand-charcoal` | `#1c1c1c` | Primary titles, table headers, stat values | 17.1:1 against `#fafaf7` |
| `--slate` | `#4a4a4a` | Primary body text, labels, table cell content | 8.9:1 against `#fafaf7` |
| `--muted` | `#8a8a8a` | Timestamps, helper descriptions, breadcrumb arrows | 4.6:1 against `#fafaf7` |
| `--border` / `--brand-border` | `#e2e8e4` | Container outlines, table dividers, card boundaries | Subtle & crisp |
| `--warm-white` | `#fafaf7` | Platform body background | Soft on eyes, zero glare |
| `--brand-white` | `#ffffff` | Elevated surface cards, modals, table surfaces | Crisp contrast |

---

## 2. Layout Grid & Structural Hierarchy

### 2.1 Desktop Viewport (>= 1024px)
- **Top Navigation Bar (`AppHeader`):** Sticky 64px height (`z-index: 50`). Displays the Sabi Africa Innovations Limited brand badge, language selector, notifications bell, and administrator avatar profile menu.
- **Admin Sidebar (`AdminSidebar`):** Collapsible 260px expanded width (68px collapsed). Keyboard toggle `Ctrl+B` / `Cmd+B`. Features clear groupings:
  1. **Platform Overview:** Dashboard.
  2. **Directory & Access:** User Management, Organisation Management, Auditor Directory.
  3. **Operational Oversight:** Engagement Oversight, Subscriptions.
  4. **Governance & Security:** Audit Trail, Security Centre, Reports & Analytics.
  5. **Configuration:** Platform Settings.
- **Main Viewport Canvas:** Max width `1440px` with responsive horizontal padding (`var(--spacing-8)`). Contains page header, breadcrumbs, search/filter controls, and content grid.

### 2.2 Tablet Viewport (768px – 1023px)
- Sidebar collapses into compact icon mode (68px width) with accessible tooltips.
- Metric statistic cards collapse from 4 columns to 2x2 grid.
- Tables support horizontal smooth swipe with sticky primary key/name columns.

### 2.3 Mobile Viewport (< 768px)
- Full-screen slide-over drawer triggered by accessible hamburger button with `aria-expanded` and focus trap.
- Single column layout for cards, metrics, and filter controls.
- Mobile bottom sheets for filter drawers and user profile inspections.

---

## 3. Detailed Module Specifications

### Module 1: Admin Dashboard
- **Top Metric Cards:** 
  1. Total Users (with Auditors, Accounting Team, Managers breakdown).
  2. Registered Organisations (Client and Audit firms).
  3. Audit Engagements (Active, Completed, Overdue).
  4. Operational Alerts & Pending Items.
- **Engagement Health Widget:** Visual progress of active client audits.
- **Recent Administrative Activity Feed:** Connected to immutable audit trail events.
- **Platform Health & Security Status:** Active session count, 2FA enforcement, system uptime.

### Module 2: User Management
- **Search & Filter:** Role filter (`ALL`, `AUDITOR`, `FINANCE_USER`, `AUDIT_MANAGER`, `ADMIN`), status filter (`ALL`, `ACTIVE`, `PENDING_INVITATION`, `LOCKED`).
- **Data Table:** User Name & Email, Role Badge, Connected Organisation, Registration Date, Two-Factor Authentication Status, Actions (`View Profile`, `Manage Access`).
- **User Detail Drawer/Modal:** Complete user profile, security telemetry, login history, and engagement associations.

### Module 3: Organisation Management
- **Directory Grid & Table:** Organisation Legal Name, Category (`Audit Practice` / `Corporate Client`), Active Engagements Count, Authorized Members Count, Status.
- **Multi-Tenant Privacy Wall:** High-level metadata displayed without exposing internal financial files.
- **Organisation Profile Modal:** Member roster, active engagements, registration details.

### Module 4: Auditor Management
- **Auditor Directory:** Name, Professional Body (`ICAN`, `ACCA`, `ICAEW`), Practicing Certificate / Membership Number, Active Engagements Lead, Verification Status.
- **Auditor Workload Card:** Engagement load, pending review count, response timeliness.

### Module 5: Engagement Oversight
- **Engagement Oversight Grid:** Client Name, Lead Auditor, Fiscal Year, Status Badge (`ACTIVE`, `IN_REVIEW`, `COMPLETED`, `OVERDUE`), Request Completion Rate, Milestone Timeline.
- **Confidentiality Shield:** Displays progress and metrics without granting direct unredacted download rights to non-assigned admins.

### Module 6: Subscription Management
- **Tier Overviews:** Professional, Firm, Enterprise Tiers.
- **Organisation Subscriptions:** Organization Name, Plan, Billing Cycle, Status (`ACTIVE`, `RENEWAL_DUE`, `EXPIRED`), Expiration Date.
- **Integration Boundary:** Highlights billing gateway status without exposing provider credentials.

### Module 7: Audit Trail & Administrative History
- **Administrative Events Feed:** Actor, Action Type, Affected Resource, Timestamp, SHA-256 Hash, Cryptographic Verification Badge.
- **Action Filters:** User events, status updates, permissions, system actions.
- **Export Utility:** Regulatory PDF / CSV export generation.

### Module 8: Security Centre
- **Session & Login Monitor:** Recent logins, IP addresses, browser user agents.
- **Security Posture:** 2FA adoption rate, session timeouts, failed login mitigation.
- **Security Incident Log:** Elevated access reviews, lockouts, credential resets.

### Module 9: Reports & Analytics
- **System Metrics:** Engagement velocity, document turnaround time, checklist completion rate.
- **Cross-Sectional Reports:** User adoption, quarterly audit readiness, compliance ratios.
- **Authoritative Data Export:** Genuine data serialization respecting tenant permissions.

### Module 10: Platform Settings
- **Configuration Sections:**
  1. Platform General Details (Platform name, support contact, maintenance window).
  2. Role & Permissions Matrix (Strictly mapping existing 4 roles).
  3. Security Policies (Session timeout 15m, 2FA policies, password complexity).
  4. Language Settings (Default locale, enabled languages: en, yo, ig, ha, pcm).
  5. Notification Delivery Preferences.

---

## 4. Internationalisation Guidelines
Every UI label, tooltip, table header, button text, empty state, and validation message must be referenced through `t('admin.*')` keys across:
- `en` (English)
- `yo` (Yoruba)
- `ig` (Igbo)
- `ha` (Hausa)
- `pcm` (Nigerian Pidgin)

