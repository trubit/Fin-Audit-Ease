import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.css'
import { App } from '@/app/App'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Fatal: Failed to locate root element in DOM.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
)
