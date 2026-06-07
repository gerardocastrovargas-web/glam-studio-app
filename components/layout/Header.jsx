"use client"
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function Header({ userEmail }) {
  const router = useRouter()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(14px)' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'rgba(226,160,150,0.14)', border: '1px solid rgba(226,160,150,0.25)' }}
        >
          ✨
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-none">Glam Studio</div>
          <div className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--muted)' }}>Mexicali, B.C.</div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: 'var(--muted)' }}
      >
        <span className="hidden sm:block max-w-[120px] truncate">{userEmail}</span>
        <LogOut size={15} />
      </button>
    </header>
  )
}