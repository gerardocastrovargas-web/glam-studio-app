import { formatMoney } from '@/lib/helpers'

export default function CobroBar({ servicioRealizado, abonado = 0, action }) {
  const total = parseFloat(servicioRealizado.costo_total) || 0
  const pct = total > 0 ? Math.min((abonado / total) * 100, 100) : 0
  const pendiente = Math.max(total - abonado, 0)

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-sm text-white leading-snug">{servicioRealizado.nombre}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {servicioRealizado.clientes?.nombre || ''}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase font-semibold" style={{ color: 'var(--muted)' }}>Total</div>
          <div className="text-sm font-bold text-white">{formatMoney(total)}</div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="font-medium text-green-400">✓ {formatMoney(abonado)}</span>
          <span className="font-medium text-red-400">⏳ {formatMoney(pendiente)}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct >= 100 ? '#34d399' : 'linear-gradient(90deg, var(--teal), #34d399)',
            }}
          />
        </div>
        <div className="text-right text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{pct.toFixed(0)}% pagado</div>
      </div>
      {action && (
        <div className="mt-1 pt-2 border-t border-white/5 flex justify-end">
          {action}
        </div>
      )}
    </div>
  )
}