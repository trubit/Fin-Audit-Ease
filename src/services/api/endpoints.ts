/**
 * FinAuditEase Backend Service Endpoint Definitions.
 *
 * ARCHITECTURAL BOUNDARY:
 * These endpoint paths define the frontend integration contract.
 * Backend implementation is owned and deployed separately by the backend engineering team.
 */

export const API_ENDPOINTS = {
  // Authentication & Session
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH_TOKEN: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    TWO_FACTOR_VERIFY: '/api/v1/auth/2fa/verify',
    TWO_FACTOR_RESEND: '/api/v1/auth/2fa/resend',
    ACCEPT_INVITATION: '/api/v1/auth/invitations/accept',
    INVITATION_DETAILS: (token: string) => `/api/v1/auth/invitations/${encodeURIComponent(token)}`,
  },

  // Engagements
  ENGAGEMENTS: {
    LIST: '/api/v1/engagements',
    DETAIL: (id: string) => `/api/v1/engagements/${id}`,
    CREATE: '/api/v1/engagements',
    UPDATE: (id: string) => `/api/v1/engagements/${id}`,
    MILESTONES: (id: string) => `/api/v1/engagements/${id}/milestones`,
    MEMBERS: (id: string) => `/api/v1/engagements/${id}/members`,
    INVITATIONS: (id: string) => `/api/v1/engagements/${id}/invitations`,
  },

  // Audit Requests
  AUDIT_REQUESTS: {
    LIST: '/api/v1/audit-requests',
    CREATE: '/api/v1/audit-requests',
    DETAIL: (id: string) => `/api/v1/audit-requests/${id}`,
    UPDATE: (id: string) => `/api/v1/audit-requests/${id}`,
    UPDATE_STATUS: (id: string) => `/api/v1/audit-requests/${id}/status`,
    COMMENTS: (id: string) => `/api/v1/audit-requests/${id}/comments`,
  },

  // Documents
  DOCUMENTS: {
    LIST: '/api/v1/documents',
    UPLOAD: '/api/v1/documents/upload',
    DETAIL: (id: string) => `/api/v1/documents/${id}`,
    DOWNLOAD: (id: string) => `/api/v1/documents/${id}/download`,
    DELETE: (id: string) => `/api/v1/documents/${id}`,
    VERSIONS: (id: string) => `/api/v1/documents/${id}/versions`,
  },

  // Checklists
  CHECKLISTS: {
    PRE_AUDIT: '/api/v1/checklists/pre-audit',
    MONTH_END: '/api/v1/checklists/month-end',
    WEEKLY: '/api/v1/checklists/weekly',
    UPDATE_ITEM: (checklistId: string, itemId: string) =>
      `/api/v1/checklists/${checklistId}/items/${itemId}`,
    SUBMIT_FOR_REVIEW: (checklistId: string) =>
      `/api/v1/checklists/${checklistId}/submit-review`,
    SIGN_OFF: (checklistId: string) =>
      `/api/v1/checklists/${checklistId}/sign-off`,
    LOCK: (checklistId: string) =>
      `/api/v1/checklists/${checklistId}/lock`,
  },

  // Reviews
  REVIEWS: {
    LIST: '/api/v1/reviews',
    DETAIL: (id: string) => `/api/v1/reviews/${id}`,
    SUBMIT_FEEDBACK: (id: string) => `/api/v1/reviews/${id}/feedback`,
    APPROVE: (id: string) => `/api/v1/reviews/${id}/approve`,
    REJECT: (id: string) => `/api/v1/reviews/${id}/reject`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications',
    MARK_AS_READ: (id: string) => `/api/v1/notifications/${id}/read`,
    MARK_ALL_READ: '/api/v1/notifications/read-all',
  },

  // Audit Trail
  AUDIT_TRAIL: {
    LIST: '/api/v1/audit-trail',
    EXPORT: '/api/v1/audit-trail/export',
  },

  // Asset Verification Register (Finance Module)
  ASSETS: {
    LIST: '/api/v1/assets',
    CREATE: '/api/v1/assets',
    DETAIL: (id: string) => `/api/v1/assets/${id}`,
    VERIFY: (id: string) => `/api/v1/assets/${id}/verify`,
    REQUEST_ACCESS: '/api/v1/assets/access-requests',
  },

  // Audit Communication & Meeting Centre
  COMMUNICATION: {
    CONVERSATIONS: '/api/v1/communication/conversations',
    CONVERSATION_DETAIL: (id: string) => `/api/v1/communication/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/api/v1/communication/conversations/${conversationId}/messages`,
    MEETINGS: '/api/v1/communication/meetings',
    MEETING_DETAIL: (id: string) => `/api/v1/communication/meetings/${id}`,
    MEETING_CONSENT: (id: string) => `/api/v1/communication/meetings/${id}/consent`,
    MEETING_JOIN: (id: string) => `/api/v1/communication/meetings/${id}/join`,
    RECORDINGS: '/api/v1/communication/recordings',
    RECORDING_DETAIL: (id: string) => `/api/v1/communication/recordings/${id}`,
    RECORDING_STREAM: (id: string) => `/api/v1/communication/recordings/${id}/stream`,
    PROVIDER_STATUS: '/api/v1/communication/meeting-provider',
  },
} as const
