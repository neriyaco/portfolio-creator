import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BioEditor from '../components/editors/BioEditor'
import LinksEditor from '../components/editors/LinksEditor'
import ThemeEditor from '../components/editors/ThemeEditor'
import PhotoEditor from '../components/editors/PhotoEditor'

export default function Dashboard() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Portfolio Admin</h1>
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
      </main>
    </div>
  )
}
