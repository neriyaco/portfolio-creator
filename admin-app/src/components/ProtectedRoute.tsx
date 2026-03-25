import { useEffect, useState, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type AuthStatus = 'loading' | 'authed' | 'unauthed'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'authed' : 'unauthed')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'authed' : 'unauthed')
    })

    return () => subscription.unsubscribe()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking session…
      </div>
    )
  }

  if (status === 'unauthed') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
