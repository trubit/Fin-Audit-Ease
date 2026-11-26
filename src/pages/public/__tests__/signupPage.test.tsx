import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { SignupPage } from '../SignupPage'

describe('SignupPage Rendering Investigation', () => {
  it('renders SignupPage in auditor mode without throwing', () => {
    expect(() => {
      const html = renderToString(
        <MemoryRouter initialEntries={['/signup?type=auditor']}>
          <SignupPage />
        </MemoryRouter>
      )
      expect(html).toContain('FinAuditEase')
      expect(html).toContain('value="OTHER"')
      expect(html).toContain('Others')
    }).not.toThrow()
  })

  it('renders SignupPage in accounting mode without throwing', () => {
    expect(() => {
      const html = renderToString(
        <MemoryRouter initialEntries={['/signup?type=accounting']}>
          <SignupPage />
        </MemoryRouter>
      )
      expect(html).toContain('FinAuditEase')
    }).not.toThrow()
  })

  it('renders SignupPage in invitation mode without throwing', () => {
    expect(() => {
      const html = renderToString(
        <MemoryRouter initialEntries={['/signup?type=invitation']}>
          <SignupPage />
        </MemoryRouter>
      )
      expect(html).toContain('FinAuditEase')
    }).not.toThrow()
  })
})
