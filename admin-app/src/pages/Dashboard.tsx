import { useNavigate, NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ConfigProvider } from '../context/ConfigContext'
import BioEditor from '../components/editors/BioEditor'
import LinksEditor from '../components/editors/LinksEditor'
import ThemeEditor from '../components/editors/ThemeEditor'
import PhotoEditor from '../components/editors/PhotoEditor'
import LogoEditor from '../components/editors/LogoEditor'
import SeoEditor from '../components/editors/SeoEditor'

function DashboardContent() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 mr-4">Portfolio Admin</h1>
        <nav className="flex items-center gap-1 flex-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            Settings
          </NavLink>
          <NavLink
            to="/posts"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            Blog
          </NavLink>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        <BioEditor />
        <LinksEditor />
        <ThemeEditor />
        <PhotoEditor />
        <LogoEditor />
        <SeoEditor />
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
