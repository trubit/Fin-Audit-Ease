import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import i18n from '@/i18n'
import { useUIStore } from '@/store/uiStore'
import { AppSidebar } from '../AppSidebar'
import type { UserProfile } from '@/features/auth/types'

let mockCurrentUser: UserProfile | null = null

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    isAuthenticated: !!mockCurrentUser,
    isLoading: false,
    authMode: 'real',
    status: mockCurrentUser ? 'authenticated' : 'unauthenticated',
  }),
}))

vi.mock('@/features/notifications', () => ({
  useNotifications: () => ({
    data: { data: [] },
  }),
}))

const mockAuditorUser: UserProfile = {
  id: 'usr-auditor-1',
  email: 'auditor@sabi.africa',
  fullName: 'Chukwuemeka Okoye',
  role: 'AUDITOR',
  organizationId: 'org-auditor-1',
  organizationName: 'Sabi Africa Audit Practice',
  isTwoFactorEnabled: false,
  createdAt: '2026-01-01T00:00:00Z',
}

const mockFinanceUser: UserProfile = {
  id: 'usr-fin-1',
  email: 'finance@sabi.africa',
  fullName: 'Amina Bello',
  role: 'FINANCE_USER',
  organizationId: 'org-fin-1',
  organizationName: 'Sabi Africa Commerce Hub',
  isTwoFactorEnabled: false,
  createdAt: '2026-01-01T00:00:00Z',
}

describe('AppSidebar Navigation & Complete Write-Up Suite', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: true, mobileNavOpen: false })
  })

  afterEach(async () => {
    await i18n.changeLanguage('en')
    mockCurrentUser = null
  })

  describe('Auditor Role Navigation Complete Text across 5 Nigerian Locales', () => {
    it('renders all Auditor sidebar labels completely in English without duplicate badges', async () => {
      await i18n.changeLanguage('en')
      mockCurrentUser = mockAuditorUser

      const html = renderToString(
        <MemoryRouter>
          <AppSidebar />
        </MemoryRouter>
      )

      // Section titles
      expect(html).toContain('Workspace')
      expect(html).toContain('Audit Module')
      expect(html).toContain('Finance Module')
      expect(html).toContain('Governance &amp; Account')

      // Complete link labels
      expect(html).toContain('Dashboard')
      expect(html).toContain('Engagements')
      expect(html).toContain('Audit Requests')
      expect(html).toContain('Audit Checklist and Supporting Documents')
      expect(html).toContain('Documents')
      expect(html).toContain('Audit Communication &amp; Meetings')
      expect(html).toContain('Audit Trail')
      expect(html).toContain('Asset Verification Register')
      expect(html).toContain('Notifications')
      expect(html).toContain('Profile')

      // Verify no duplicate badge
      expect(html).not.toContain('module-badge--audit')
      expect(html).not.toContain('module-badge--finance')
    })

    it('renders all Auditor sidebar labels completely in Hausa (ha)', async () => {
      await i18n.changeLanguage('ha')
      mockCurrentUser = mockAuditorUser

      const html = renderToString(
        <MemoryRouter>
          <AppSidebar />
        </MemoryRouter>
      )

      expect(html).toContain('Wurin Aiki')
      expect(html).toContain('Sashen Binciken Kudi')
      expect(html).toContain('Sashen Kudi')
      expect(html).toContain('Gudanarwa &amp; Asusun Aiki')
      expect(html).toContain('Jerin Binciken Kudi da Takardun Shaida')
      expect(html).toContain('Sadarwar Bincike &amp; Tarurruka')
      expect(html).toContain('Rijistar Tabbatar da Kadarori')
    })

    it('renders all Auditor sidebar labels completely in Yoruba (yo)', async () => {
      await i18n.changeLanguage('yo')
      mockCurrentUser = mockAuditorUser

      const html = renderToString(
        <MemoryRouter>
          <AppSidebar />
        </MemoryRouter>
      )

      expect(html).toContain('Ààyè Iṣẹ́')
      expect(html).toContain('Módùlù Àyẹ̀wò Owó')
      expect(html).toContain('Módùlù Ìṣúná Owó')
      expect(html).toContain('Àkóso &amp; Àkọọ́lẹ̀')
      expect(html).toContain('Àkójọ Àyẹ̀wò àti Àwọn Ìwé Ẹ̀rí')
      expect(html).toContain('Ìbánisọ̀rọ̀ Àyẹ̀wò &amp; Àwọn Ìpàdé')
      expect(html).toContain('Ìforúkọsílẹ̀ Ìmúdájú Ohun-Ìní')
    })

    it('renders all Auditor sidebar labels completely in Igbo (ig)', async () => {
      await i18n.changeLanguage('ig')
      mockCurrentUser = mockAuditorUser

      const html = renderToString(
        <MemoryRouter>
          <AppSidebar />
        </MemoryRouter>
      )

      expect(html).toContain('Ebe Ọrụ')
      expect(html).toContain('Mpaghara Nyocha (Audit Module)')
      expect(html).toContain('Mpaghara Ego (Finance Module)')
      expect(html).toContain('Nlekọta &amp; Akaụntụ')
      expect(html).toContain('Ndepụta Nyocha na Akwụkwọ Nkwado')
      expect(html).toContain('Nkwukọrịta Nnyocha &amp; Nzukọ')
      expect(html).toContain('Ndekọ Nkwenye Akụ')
    })

    it('renders all Auditor sidebar labels completely in Nigerian Pidgin (pcm)', async () => {
      await i18n.changeLanguage('pcm')
      mockCurrentUser = mockAuditorUser

      const html = renderToString(
        <MemoryRouter>
          <AppSidebar />
        </MemoryRouter>
      )

      expect(html).toContain('Work Space')
      expect(html).toContain('Audit Module')
      expect(html).toContain('Finance Module')
      expect(html).toContain('Audit Checklist and Supporting Documents')
      expect(html).toContain('Messages &amp; Video Call')
      expect(html).toContain('Asset Verification Register')
    })
  })

  describe('Finance User Role Navigation Complete Text across Locales', () => {
    it('renders all Finance user navigation items completely in English and Hausa', async () => {
      await i18n.changeLanguage('en')
      mockCurrentUser = mockFinanceUser

      let html = renderToString(
        <MemoryRouter>
          <AppSidebar />
        </MemoryRouter>
      )

      expect(html).toContain('Weekly Checklist')
      expect(html).toContain('Month-End Close Checklist')
      expect(html).toContain('Pre-Audit')
      expect(html).toContain('Team Chat &amp; Meetings')

      await i18n.changeLanguage('ha')
      html = renderToString(
        <MemoryRouter>
          <AppSidebar />
        </MemoryRouter>
      )

      expect(html).toContain('Jerin Binciken Mako-mako')
      expect(html).toContain('Jerin Rufe Ƙarshen Wata')
      expect(html).toContain('Kafin Bincike')
      expect(html).toContain('Tattaunawar Kungiya &amp; Tarurruka')
    })
  })

  describe('Role Orientation Card Display', () => {
    it('renders user full name, organization, and localized role', async () => {
      await i18n.changeLanguage('en')
      mockCurrentUser = mockAuditorUser

      const html = renderToString(
        <MemoryRouter>
          <AppSidebar />
        </MemoryRouter>
      )

      expect(html).toContain('Sabi Africa Audit Practice')
      expect(html).toContain('Auditor')
    })
  })
})
