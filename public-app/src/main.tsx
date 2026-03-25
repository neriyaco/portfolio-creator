import './lib/crypto-polyfill'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Apply dir + lang before first render to avoid RTL flash
const savedLocale = localStorage.getItem('i18n-locale') ?? 'en'
document.documentElement.lang = savedLocale
document.documentElement.dir = savedLocale === 'he' ? 'rtl' : 'ltr'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
