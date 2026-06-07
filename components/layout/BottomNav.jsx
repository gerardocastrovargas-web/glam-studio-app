"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Users, CreditCard } from 'lucide-react'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/agenda', icon: Calendar, label: 'Agenda' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/cobros', icon: CreditCard, label: 'Cobros' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center"
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(14px)' }}
    >
      <div className="w-full flex" style={{ maxWidth: 560 }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
              style={{ color: active ? 'var(--teal)' : 'var(--muted)' }}
            >
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
              {active && <div className="w-1 h-1 rounded-full" style={{ background: 'var(--teal)', marginTop: -2 }} />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}