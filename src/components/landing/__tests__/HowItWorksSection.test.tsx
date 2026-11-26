import { describe, it, expect, afterEach } from 'vitest'
import { renderToString } from 'react-dom/server'
import i18n from '@/i18n'
import { HowItWorksSection } from '../HowItWorksSection'

describe('HowItWorksSection Localization', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders English stage badge and content correctly', async () => {
    await i18n.changeLanguage('en')
    const html = renderToString(<HowItWorksSection />)
    expect(html).toContain('Stage 01')
    expect(html).toContain('Engagement Scope &amp; Terms Established')
  })

  it('renders Hausa stage badge and content correctly', async () => {
    await i18n.changeLanguage('ha')
    const html = renderToString(<HowItWorksSection />)
    expect(html).toContain('Mataki 01')
    expect(html).toContain('An Kafa Iyaka da Sharuɗɗan Aiki')
  })

  it('renders Yoruba stage badge and content correctly', async () => {
    await i18n.changeLanguage('yo')
    const html = renderToString(<HowItWorksSection />)
    expect(html).toContain('Ìpele 01')
    expect(html).toContain('Aala Iṣẹ &amp; Awọn Ilana Ayẹwo Ti Fidi Mulẹ')
  })

  it('renders Igbo stage badge and content correctly', async () => {
    await i18n.changeLanguage('ig')
    const html = renderToString(<HowItWorksSection />)
    expect(html).toContain('Ọkwa 01')
    expect(html).toContain('Ntinye Aka (Engagement)')
    expect(html).toContain('Onye Nyocha')
  })

  it('renders Nigerian Pidgin stage badge and content correctly', async () => {
    await i18n.changeLanguage('pcm')
    const html = renderToString(<HowItWorksSection />)
    expect(html).toContain('Stage 01')
    expect(html).toContain('Engagement Scope &amp; Terms Don Set')
  })
})

