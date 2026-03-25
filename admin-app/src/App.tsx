import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { TypesafeI18n, useI18n } from './i18n/i18n-react'
import type { Locales } from './i18n/i18n-types'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import PostsPage from './pages/PostsPage'
import PostEditorPage from './pages/PostEditorPage'
import ProtectedRoute from './components/ProtectedRoute'

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/posts',
      element: (
        <ProtectedRoute>
          <PostsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/posts/new',
      element: (
        <ProtectedRoute>
          <PostEditorPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/posts/:id',
      element: (
        <ProtectedRoute>
          <PostEditorPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ],
  { basename: '/admin' },
)

function I18nEffects() {
  const { locale } = useI18n()
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr'
    localStorage.setItem('admin-i18n-locale', locale)
  }, [locale])
  return null
}

export default function App() {
  const initialLocale = (localStorage.getItem('admin-i18n-locale') ?? 'en') as Locales
  return (
    <TypesafeI18n locale={initialLocale}>
      <I18nEffects />
      <RouterProvider router={router} />
    </TypesafeI18n>
  )
}
