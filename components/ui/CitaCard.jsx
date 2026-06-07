import { ESTADO_CONFIG, formatTime } from '@/lib/helpers'
import { Clock, ChevronRight } from 'lucide-react'

export default function CitaCard({ cita, onClick }) {
  const config = ESTADO_CONFIG[cita.estado] || ESTADO_CONFIG.sin_confirmar
  const cliente = cita.clientes

  return (
    <button
      onClick={onClick}
      className="w-full text-left card flex items-center gap-3 transition-colors hover:bg-[var(--surface-2)] active:scale-[0.99]"
    >
      <div className="flex flex-col items-center min-w-[46px]">
        <Clock size={12} style={{ color: 'var(--muted)', marginBottom: 3 }} />
        <span className="text-sm font-bold text-white">{formatTime(cita.hora)}</span>
      </div>
      <div className="w-px h-10 bg-white/10" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-white truncate">{cliente?.nombre || 'Cliente'}</div>
        <div className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>{cita.servicio}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`badge ${config.bg} ${config.color} ${config.border}`}>{config.label}</span>
        <ChevronRight size={15} style={{ color: 'var(--muted)' }} />
      </div>
    </button>
  )
}