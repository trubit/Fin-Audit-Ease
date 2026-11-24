import { describe, it, expect, beforeEach } from 'vitest'
import { documentRepositoryStore, clearMemoryDocs } from '../services/documentRepositoryStore'
import { documentService } from '../services/documentService'
import { communicationService } from '@/features/communication/services/communicationService'

describe('Document Repository, Forwarding & Colleague Communication Workflow', () => {
  beforeEach(() => {
    clearMemoryDocs()
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  })

  describe('Document Repository & Forwarding', () => {
    it('initializes repository with an empty list without fabricating fake records in production', () => {
      const docs = documentRepositoryStore.getDocuments()
      expect(docs).toEqual([])
    })

    it('allows an auditor to forward an approved audit request schedule to the repository', () => {
      const forwarded = documentService.forwardDocument({
        title: 'Bank Reconciliation Schedule Q3',
        classification: 'RECONCILIATION_SCHEDULE',
        source: 'AUDIT_APPROVAL',
        approverOrForwarderName: 'Dr. Ibrahim Babatunde, FCA (Lead Auditor)',
        notes: 'Auditor approved and verified against direct bank confirmation.',
      })

      expect(forwarded.id).toBeDefined()
      expect(forwarded.forwardedFrom).toBe('AUDIT_APPROVAL')
      expect(forwarded.reviewerName).toContain('Dr. Ibrahim Babatunde')
      expect(forwarded.status).toBe('APPROVED')

      const repositoryDocs = documentRepositoryStore.getDocuments()
      expect(repositoryDocs.some((d) => d.id === forwarded.id)).toBe(true)
    })

    it('allows an accountant to forward a supervisor-approved schedule to the repository', () => {
      const forwarded = documentService.forwardDocument({
        title: 'Weekly Petty Cash Reconciliations - Week 3',
        classification: 'RECONCILIATION_SCHEDULE',
        source: 'SUPERVISOR_APPROVAL',
        approverOrForwarderName: 'Femi Adeleke, FCA (Accounting Supervisor)',
        notes: 'Accounting supervisor reviewed and reconciled with physical vouchers.',
      })

      expect(forwarded.id).toBeDefined()
      expect(forwarded.forwardedFrom).toBe('SUPERVISOR_APPROVAL')
      expect(forwarded.reviewerName).toContain('Femi Adeleke')
      expect(forwarded.status).toBe('APPROVED')

      const repositoryDocs = documentRepositoryStore.getDocuments()
      expect(repositoryDocs.some((d) => d.id === forwarded.id)).toBe(true)
    })

    it('getDocuments falls back safely to stored repository documents when backend is unprovisioned', async () => {
      documentService.forwardDocument({
        title: 'Verified Trial Balance Schedule',
        source: 'AUDIT_APPROVAL',
      })
      const res = await documentService.getDocuments()
      expect(res.success).toBe(true)
      expect(res.data.length).toBeGreaterThan(0)
    })
  })

  describe('Accountant WhatsApp-style Personal Chat & Meeting Creation', () => {
    it('provides conversations including direct personal chats between colleagues', async () => {
      const res = await communicationService.getConversations()
      expect(res.success).toBe(true)
      expect(Array.isArray(res.data)).toBe(true)
    })

    it('persists sent personal messages locally so conversation history is preserved', async () => {
      const convId = 'private-dev-finance-id-dev-accounting-manager-id'
      const sendRes = await communicationService.sendMessage(convId, {
        content: 'Supervisor Femi, I have forwarded the reconciled fixed asset schedule to the Document Repository.',
      })

      expect(sendRes.success).toBe(true)
      expect(sendRes.data.content).toContain('forwarded the reconciled fixed asset schedule')

      const msgRes = await communicationService.getMessages(convId)
      expect(msgRes.success).toBe(true)
      expect(msgRes.data.some((m) => m.content.includes('forwarded the reconciled fixed asset schedule'))).toBe(true)
    })

    it('allows accountants to create/schedule a walkthrough meeting', async () => {
      const meetingRes = await communicationService.scheduleMeeting({
        title: 'Year-End Inventory & Fixed Assets Reconciliation Review',
        agenda: 'Examine asset counts and supplier statement discrepancies.',
        scheduledDate: '2026-11-25',
        startTime: '14:00',
        durationMinutes: 60,
        meetingType: 'WALKTHROUGH',
        recordingPolicy: 'MANDATORY',
        engagementId: 'eng-100',
        timezone: 'Africa/Lagos',
        participantUserIds: ['dev-finance-id', 'dev-accounting-manager-id'],
      })

      expect(meetingRes.success).toBe(true)
      expect(meetingRes.data.id).toBeDefined()
      expect(meetingRes.data.title).toBe('Year-End Inventory & Fixed Assets Reconciliation Review')
      expect(meetingRes.data.status).toBe('SCHEDULED')

      const meetings = await communicationService.getMeetings()
      expect(meetings.data.some((m) => m.id === meetingRes.data.id)).toBe(true)
    })
  })
})

