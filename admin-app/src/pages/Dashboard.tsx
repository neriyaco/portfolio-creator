import { useNavigate, NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n/i18n-react'
import { ConfigProvider } from '../context/ConfigContext'
import BioEditor from '../components/editors/BioEditor'
import LinksEditor from '../components/editors/LinksEditor'
import ThemeEditor from '../components/editors/ThemeEditor'
import PhotoEditor from '../components/editors/PhotoEditor'
import LogoEditor from '../components/editors/LogoEditor'
import SeoEditor from '../components/editors/SeoEditor'
import LocaleEditor from '../components/editors/LocaleEditor'

function DashboardContent() {
  const navigate = useNavigate()
  const { LL, locale, setLocale } = useI18n()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-3">
        <h1 className="hidden sm:block text-xl font-bold text-gray-800 mr-2">{LL.nav.appName()}</h1>
        <nav className="flex items-center gap-1 flex-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            {LL.nav.settings()}
          </NavLink>
          <NavLink
            to="/posts"
            className={({ isActive }) =>
              `px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            {LL.nav.blog()}
          </NavLink>
        </nav>
        <div className="flex items-center gap-0 text-xs shrink-0">
          <button
            onClick={() => setLocale('en')}
            className={`px-1.5 py-0.5 rounded transition-colors ${locale === 'en' ? 'text-gray-800 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
          >
            EN
          </button>
          <span className="text-gray-200 select-none">|</span>
          <button
            onClick={() => setLocale('he')}
            className={`px-1.5 py-0.5 rounded transition-colors ${locale === 'he' ? 'text-gray-800 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
          >
            עב
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">{LL.nav.logout()}</span>
        </button>
      </header>
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8 flex flex-col gap-4 sm:gap-6">
        <BioEditor />
        <LinksEditor />
        <ThemeEditor />
        <PhotoEditor />
        <LogoEditor />
        <SeoEditor />
        <LocaleEditor />
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ConfigProvider>
      <DashboardContent />
    </ConfigProvider>
  )
}
