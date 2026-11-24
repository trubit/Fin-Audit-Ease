# FinAuditEase Engagement Manager Roles — UI/UX Prototype & Design Specifications

**Directory:** `prototypes/engagement-managers/`  
**Phase:** 18  
**Target Roles:**
1. **Audit Engagement Manager (`AUDIT_MANAGER`)**
2. **Accounting Engagement Manager (`ACCOUNTING_MANAGER`)**

---

## 1. High-Fidelity Prototype Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │            FinAuditEase Header               │
                  │  [Logo] FinAuditEase [Role Badge]  [🌐] [User]│
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
┌─────────────────────────────────┐                     ┌──────────────────────────────────┐
│   AUDIT ENGAGEMENT MANAGER      │                     │  ACCOUNTING ENGAGEMENT MANAGER   │
│   (External Audit Firm)         │                     │  (Client Corporate Accounting)   │
├─────────────────────────────────┤                     ├──────────────────────────────────┤
│ 1. Multi-Engagement Portfolio   │                     │ 1. Corporate Close Overview      │
│    - Active / In Review / Due   │                     │    - Weekly & Month-End Close    │
│    - Overall Delivery Health    │                     │    - Pre-Audit Runway Countdown  │
│                                 │                     │                                  │
│ 2. Auditor Workload Tracker     │                     │ 2. Statutory Tax Radar           │
│    - Field Auditor Assignments  │                     │    - PAYE (10th)                 │
│    - Active PBC Requests Ratio  │                     │    - VAT (21st)                  │
│                                 │                     │    - WHT (21st)                  │
│ 3. Managerial Review Queue      │                     │                                  │
│    - Submitted Client Evidence  │                     │ 3. External Auditor Requests     │
│    - Quality Control Sign-Off   │                     │    - Unassigned PBCs             │
│                                 │                     │    - Internal SME Assignments    │
│ 4. Team & Engagement Actions    │                     │                                  │
│    - Assign Field Auditor Modal │                     │ 4. Supervisory Actions           │
│    - Reassign Overdue Requests  │                     │    - Supervisor Checklist Review │
│                                 │                     │    - Period Lock & Sign-Off      │
└─────────────────────────────────┘                     └──────────────────────────────────┘
```

---

## 2. Desktop, Tablet & Mobile Responsive Viewport Specifications

| Screen Size | Breakpoint | Audit Manager Layout | Accounting Manager Layout |
| :--- | :--- | :--- | :--- |
| **Desktop** | `>= 1024px` | 3-column KPI ribbon, 2-column split (Portfolio Engagements + Auditor Staff Workload), Full Review Queue table | 3-column statutory compliance ribbon, 2-column split (Checklist Health + PBC Request Assignment), Asset Summary table |
| **Tablet** | `768px – 1023px` | 2-column KPI grid, stacked portfolio cards with collapsible auditor list, compact table scroll | 2-column KPI grid, stacked close progress with expandable tax radar, compact table scroll |
| **Mobile** | `< 768px` | Single-column stacked cards, horizontal swipeable tab bar, bottom-sheet assignment actions | Single-column stacked cards, urgent tax deadline highlight badge, touch-friendly checklist controls |

---

## 3. UI States Matrix

- **Loading State:** Shimmering skeleton loaders (`LoadingSkeleton`) matching the exact layout dimensions.
- **Empty State:** Illustrated empty card with specific guidance:
  - *Audit Manager:* "No active client engagements currently assigned to your assurance portfolio. Initialize a new engagement or accept firm assignment."
  - *Accounting Manager:* "No outstanding audit requests from external auditors. All corporate checklist items are up to date."
- **Error State:** Dismissible `PageError` alert with retry button connecting to TanStack Query `refetch()`.
- **Unauthorized State:** Redirect to `/unauthorized` preserving zero privilege leakage.

