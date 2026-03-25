import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
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

export default function App() {
  return <RouterProvider router={router} />
}
