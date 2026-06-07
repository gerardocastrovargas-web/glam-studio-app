"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Ingresa tu email y contraseña.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError('Email o contraseña incorrectos.')
    else router.replace('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 600, height: 400, background: 'radial-gradient(ellipse at center top, rgba(226,160,150,0.1) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 pointer-events-none" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(226,160,150,0.05) 0%, transparent 70%)' }} />

      <div className="w-full relative" style={{ maxWidth: 380 }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(226,160,150,0.2), rgba(226,160,150,0.08))', border: '1px solid rgba(226,160,150,0.35)' }}
          >
            ✨
          </div>
          <h1 className="font-serif text-4xl text-white mb-1">Glam Studio</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Mexicali, Baja California</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(226,160,150,0.1)', color: 'var(--teal)', border: '1px solid rgba(226,160,150,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sistema activo
          </div>
        </div>

        {/* Form Card */}
        <div className="card" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-center text-sm mb-5" style={{ color: 'var(--muted)' }}>Inicia sesión para continuar</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input type="email" className="input" placeholder="admin@glamstudio.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--muted)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-center rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1" style={{ fontSize: 15, padding: '14px 20px' }}>
              {loading ? 'Iniciando sesión...' : 'Ingresar al sistema →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--muted)' }}>
          Sistema de uso exclusivo de Glam Studio.
        </p>
      </div>
    </div>
  )
}