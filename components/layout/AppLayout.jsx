"use client"
import { useAuth } from '@/lib/AuthContext'
import Header from './Header'
import BottomNav from './BottomNav'

export default function AppLayout({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">✨</div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Cargando sistema...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Header userEmail={user.email} />
      <main className="page-container">{children}</main>
      <BottomNav />
    </div>
  )
}