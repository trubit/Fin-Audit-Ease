import React, { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import type { SupportedLocale } from '@/config/app.config'
import './LanguageSwitcher.css'

export interface LanguageSwitcherProps {
  readonly variant?: 'header' | 'footer' | 'compact'
  readonly className?: string
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { currentLocale, currentOption, options, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Keyboard navigation & click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelectLanguage = (code: SupportedLocale) => {
    changeLanguage(code)
    setIsOpen(false)
  }

  const buttonId = `language-switcher-${variant}-button`

  return (
    <div
      ref={dropdownRef}
      className={`lang-switcher lang-switcher--${variant} ${className}`}
    >
      <button
        type="button"
        id={buttonId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="lang-switcher-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select language. Current language: ${currentOption.nativeName}`}
      >
        <Globe size={16} className="lang-switcher-globe" aria-hidden="true" />
        <span className="lang-switcher-current-name">{currentOption.nativeName}</span>
        <span className="lang-switcher-code-badge" aria-hidden="true">{currentLocale.toUpperCase()}</span>
        <ChevronDown size={14} className={`lang-switcher-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <ul
          className="lang-switcher-dropdown"
          role="listbox"
          aria-labelledby={buttonId}
        >
          {options.map((opt) => {
            const isSelected = opt.code === currentLocale
            return (
              <li
                key={opt.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectLanguage(opt.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectLanguage(opt.code)
                  }
                }}
                tabIndex={0}
                className={`lang-switcher-option ${isSelected ? 'is-selected' : ''}`}
              >
                <div className="lang-switcher-option-text">
                  <span className="lang-switcher-native">{opt.nativeName}</span>
                  <span className="lang-switcher-english">({opt.name})</span>
                </div>
                {isSelected && (
                  <Check size={16} className="lang-switcher-check" aria-hidden="true" />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
