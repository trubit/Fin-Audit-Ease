import type { AuditDocument, DocumentClassification } from '../types'

const STORAGE_KEY = 'finauditease_document_repository'

const isLegacyDummyDoc = (d: AuditDocument): boolean => {
  if (!d) return true
  const fn = d.fileName || ''
  const id = d.id || ''
  return (
    id.startsWith('doc-seed-') ||
    id.startsWith('doc-repo-') ||
    fn.includes('Audited_Trial_Balance_FY2025') ||
    fn.includes('Bank_Confirmation_Zenith') ||
    fn.includes('Fixed_Asset_Register_Physical') ||
    fn.includes('Supplier_Vendor_Reconciliation')
  )
}

// Immediately purge any stale legacy dummy documents from browser localStorage
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const cleanDocs = parsed.filter((d: AuditDocument) => !isLegacyDummyDoc(d))
        if (cleanDocs.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanDocs))
        }
      }
    }
  } catch {
    // ignore
  }
}

export interface ForwardToRepositoryPayload {
  readonly title: string
  readonly fileName?: string
  readonly classification?: DocumentClassification
  readonly engagementId?: string
  readonly notes?: string
  readonly source: 'AUDIT_APPROVAL' | 'SUPERVISOR_APPROVAL' | 'CHECKLIST' | 'EXTERNAL_UPLOAD'
  readonly approverOrForwarderName?: string
  readonly fileSizeBytes?: number
  readonly mimeType?: string
}

let memoryDocs: AuditDocument[] = []

export const clearMemoryDocs = (): void => {
  memoryDocs = []
}

class DocumentRepositoryStore {
  /**
   * Retrieves all documents stored in the repository, optionally filtered by engagement.
   * Does NOT auto-seed fake documents into production storage.
   */
  getDocuments(engagementId?: string): AuditDocument[] {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (!Array.isArray(parsed)) {
            localStorage.removeItem(STORAGE_KEY)
            return []
          }
          const cleanDocs = parsed.filter((d: AuditDocument) => !isLegacyDummyDoc(d))
          if (cleanDocs.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanDocs))
          }
          if (engagementId && engagementId !== 'ALL') {
            return cleanDocs.filter((d: AuditDocument) => d.engagementId === engagementId || !d.engagementId)
          }
          return cleanDocs
        }
      } else {
        const cleanDocs = memoryDocs.filter((d: AuditDocument) => !isLegacyDummyDoc(d))
        if (engagementId && engagementId !== 'ALL') {
          return cleanDocs.filter((d: AuditDocument) => d.engagementId === engagementId || !d.engagementId)
        }
        return cleanDocs
      }
      return []
    } catch {
      return []
    }
  }

  /**
   * Stores a newly uploaded or forwarded document into the repository.
   */
  addDocument(doc: AuditDocument): AuditDocument {
    try {
      const docs = this.getDocuments()
      const updated = [doc, ...docs.filter((d) => d.id !== doc.id)]
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } else {
        memoryDocs = updated
      }
      return doc
    } catch {
      return doc
    }
  }

  /**
   * Forwards an approved document or schedule directly into the Document Repository.
   */
  forwardToRepository(payload: ForwardToRepositoryPayload): AuditDocument {
    const timestamp = new Date().toISOString()
    const cleanFileName =
      payload.fileName ||
      `${payload.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Approved.pdf`

    const isSupervisor = payload.source === 'SUPERVISOR_APPROVAL'

    const newDoc: AuditDocument = {
      id: `doc-fwd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fileName: cleanFileName,
      originalFileName: cleanFileName,
      fileSizeBytes: payload.fileSizeBytes || 1542000,
      mimeType: payload.mimeType || 'application/pdf',
      classification: payload.classification || 'RECONCILIATION_SCHEDULE',
      uploadedByUserId: 'usr-forwarder',
      uploadedByUserName: payload.approverOrForwarderName || (isSupervisor ? 'Corporate Accounting Supervisor' : 'Lead Auditor'),
      engagementId: payload.engagementId || '',
      status: 'APPROVED',
      reviewerName: payload.approverOrForwarderName || (isSupervisor ? 'Accounting Supervisor' : 'Lead Auditor'),
      reviewedAt: timestamp,
      reviewNotes: payload.notes || (isSupervisor ? 'Verified and approved by accounting supervisor.' : 'Approved and verified by statutory auditor.'),
      forwardedFrom: payload.source,
      forwardedByName: payload.approverOrForwarderName,
      forwardedAt: timestamp,
      comment: payload.notes || `Forwarded from ${payload.title}`,
      createdAt: timestamp,
    }

    return this.addDocument(newDoc)
  }
}

export const documentRepositoryStore = new DocumentRepositoryStore()

