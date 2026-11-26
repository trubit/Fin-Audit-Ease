import { describe, it, expect, afterEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import i18n from '@/i18n'
import { SixMonthPreAuditSection } from '../SixMonthPreAuditSection'

describe('SixMonthPreAuditSection Localization', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders English tags correctly', async () => {
    await i18n.changeLanguage('en')
    const html = renderToString(<SixMonthPreAuditSection />)
    expect(html).toContain('T-6 Months')
    expect(html).toContain('Step 1')
    expect(html).toContain('Step 2')
    expect(html).toContain('Step 3')
    expect(html).toContain('Step 4')
    expect(html).toContain('Step 5')
    expect(html).toContain('Ready')
  })

  it('renders Hausa tags correctly', async () => {
    await i18n.changeLanguage('ha')
    const html = renderToString(<SixMonthPreAuditSection />)
    expect(html).toContain('Watanni 6')
    expect(html).toContain('Mataki 1')
    expect(html).toContain('Mataki 2')
    expect(html).toContain('Mataki 3')
    expect(html).toContain('Mataki 4')
    expect(html).toContain('Mataki 5')
    expect(html).toContain('A Shirye')
  })

  it('renders Yoruba tags correctly', async () => {
    await i18n.changeLanguage('yo')
    const html = renderToString(<SixMonthPreAuditSection />)
    expect(html).toContain('Oṣù 6 Ṣáájú')
    expect(html).toContain('Ìgbésẹ̀ 1')
    expect(html).toContain('Ìgbésẹ̀ 2')
    expect(html).toContain('Ìgbésẹ̀ 3')
    expect(html).toContain('Ìgbésẹ̀ 4')
    expect(html).toContain('Ìgbésẹ̀ 5')
    expect(html).toContain('Múrasílẹ̀')
  })

  it('renders Igbo tags correctly', async () => {
    await i18n.changeLanguage('ig')
    const html = renderToString(<SixMonthPreAuditSection />)
    expect(html).toContain('Ọnwa 6 Tupu')
    expect(html).toContain('Nzọụkwụ 1')
    expect(html).toContain('Nzọụkwụ 2')
    expect(html).toContain('Nzọụkwụ 3')
    expect(html).toContain('Nzọụkwụ 4')
    expect(html).toContain('Nzọụkwụ 5')
    expect(html).toContain('Njikere')
  })

  it('renders Nigerian Pidgin tags correctly', async () => {
    await i18n.changeLanguage('pcm')
    const html = renderToString(<SixMonthPreAuditSection />)
    expect(html).toContain('T-6 Months')
    expect(html).toContain('Step 1')
    expect(html).toContain('Step 2')
    expect(html).toContain('Step 3')
    expect(html).toContain('Step 4')
    expect(html).toContain('Step 5')
    expect(html).toContain('Ready')
  })
})

