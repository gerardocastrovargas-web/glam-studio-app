import { getInitials, calcAge } from '@/lib/helpers'
import { ChevronRight } from 'lucide-react'

export default function ClienteCard({ cliente, saldoPendiente = 0, onClick }) {
  const age = calcAge(cliente.fecha_nacimiento)

  return (
    <button
      onClick={onClick}
      className="w-full text-left card flex items-center gap-3 transition-colors hover:bg-[var(--surface-2)] active:scale-[0.99]"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: 'rgba(226,160,150,0.14)', color: 'var(--teal)' }}
      >
        {getInitials(cliente.nombre)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-white truncate">{cliente.nombre}</div>
        <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
          {age ? `${age} años` : ''}
          {cliente.colonia ? ` • ${cliente.colonia}` : ''}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        {saldoPendiente > 0 ? (
          <span className="badge bg-red-400/10 text-red-400 border-red-400/30">Pendiente</span>
        ) : (
          <span className="badge bg-green-400/10 text-green-400 border-green-400/30">Al corriente</span>
        )}
        <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
      </div>
    </button>
  )
}