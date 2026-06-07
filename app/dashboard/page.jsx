"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatMoney, getTodayStr, ESTADO_CONFIG, getWeekDays, dateToStr, getDayName, formatTime, getWhatsAppLink } from '@/lib/helpers'
import AppLayout from '@/components/layout/AppLayout'
import StatCard from '@/components/ui/StatCard'
import CitaCard from '@/components/ui/CitaCard'
import PageHeader from '@/components/ui/PageHeader'
import BottomSheet from '@/components/ui/BottomSheet'
import { useToast } from '@/components/ui/Toast'
import { Calendar, TrendingUp, CreditCard, XCircle, CheckCircle, Bell } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ citasHoy: 0, ingresoMes: 0, porCobrar: 0, canceladas: 0 })
  const [citasHoy, setCitasHoy] = useState([])
  const [chart7, setChart7] = useState([])
  const [selectedCita, setSelectedCita] = useState(null)
  const [weekDays, setWeekDays] = useState([])
  const [citasDates, setCitasDates] = useState(new Set())
  const today = getTodayStr()

  useEffect(() => {
    setWeekDays(getWeekDays(new Date()))
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const now = new Date()
    const firstOfMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01'
    const sevenAgo = dateToStr(new Date(Date.now() - 6 * 86400000))
    const [r1, r2, r3, r4, r5, r6] = await Promise.all([
      supabase.from('citas').select('*, clientes(nombre, telefono, activo)').eq('fecha', today).order('hora'),
      supabase.from('cobros').select('monto').gte('fecha', firstOfMonth),
      supabase.from('servicios_realizados').select('id, costo_total, cobros(monto), clientes(activo)').eq('activo', true),
      supabase.from('citas').select('id, clientes(activo)').eq('estado', 'cancelada').gte('fecha', firstOfMonth),
      supabase.from('cobros').select('monto, fecha').gte('fecha', sevenAgo),
      supabase.from('citas').select('fecha, clientes(activo)').gte('fecha', firstOfMonth),
    ])
    const citasData = (r1.data || []).filter(c => c.clientes?.activo !== false)
    setCitasHoy(citasData)
    const ingresoMes = (r2.data || []).reduce((s, c) => s + parseFloat(c.monto), 0)
    let porCobrar = 0
    for (const t of r3.data || []) {
      if (t.clientes?.activo !== true) continue
      const ab = (t.cobros || []).reduce((s, c) => s + parseFloat(c.monto), 0)
      porCobrar += Math.max(parseFloat(t.costo_total) - ab, 0)
    }
    const canceladas = (r4.data || []).filter(c => c.clientes?.activo !== false).length
    setStats({ citasHoy: citasData.length, ingresoMes, porCobrar, canceladas })
    const cobMap = {}
    for (const c of r5.data || []) cobMap[c.fecha] = (cobMap[c.fecha] || 0) + parseFloat(c.monto)
    const days7 = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const str = dateToStr(d)
      days7.push({ date: str, amount: cobMap[str] || 0, day: getDayName(d) })
    }
    setChart7(days7)
    setCitasDates(new Set((r6.data || []).filter(c => c.clientes?.activo !== false).map(c => c.fecha)))
    setLoading(false)
  }

  async function updateEstado(id, estado) {
    const { error } = await supabase.from('citas').update({ estado }).eq('id', id)
    if (error) toast('Error al actualizar el estado.', 'error')
    else { toast('Estado actualizado.', 'success'); setSelectedCita(null); loadData() }
  }

  async function sendRecordatorio(cita) {
    await supabase.from('citas').update({ recordatorio_enviado: true }).eq('id', cita.id)
    toast('Recordatorio registrado.', 'success')
    setSelectedCita(prev => prev ? { ...prev, recordatorio_enviado: true } : null)
    loadData()
  }

  const maxChart = Math.max(...chart7.map(d => d.amount), 1)

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
      />
      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <StatCard icon={Calendar} label="Citas hoy" value={stats.citasHoy} sub="Agendadas" color="#e2a096" />
            <StatCard icon={TrendingUp} label="Ingreso mes" value={formatMoney(stats.ingresoMes)} sub="Cobros pagados" color="#34d399" />
            <StatCard icon={CreditCard} label="Por cobrar" value={formatMoney(stats.porCobrar)} sub="Saldo pendiente" color="#f87171" />
            <StatCard icon={XCircle} label="Canceladas" value={stats.canceladas} sub="Este mes" color="#fbbf24" />
          </div>
          <div className="card mb-5">
            <div className="label mb-4">Ingresos — últimos 7 días</div>
            <div className="flex items-end gap-1.5" style={{ height: 72 }}>
              {chart7.map((d, i) => {
                const h = (d.amount / maxChart) * 100
                const isToday = d.date === today
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end justify-center" style={{ height: 52 }}>
                      <div className="w-full rounded-t-md" style={{ height: Math.max(h, 5) + '%', background: isToday ? 'var(--teal)' : 'rgba(226,160,150,0.28)' }} />
                    </div>
                    <span className="text-[9px] font-semibold" style={{ color: isToday ? 'var(--teal)' : 'var(--muted)' }}>{d.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="card mb-5">
            <div className="label mb-3">Semana actual</div>
            <div className="flex gap-1 justify-between">
              {weekDays.map((day, i) => {
                const str = dateToStr(day)
                const isToday = str === today
                const hasCita = citasDates.has(str)
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-semibold" style={{ color: 'var(--muted)' }}>{getDayName(day)}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: isToday ? 'var(--teal)' : 'transparent', color: isToday ? '#0d0c0f' : 'var(--text)' }}>
                      {day.getDate()}
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: hasCita ? 'var(--teal)' : 'transparent' }} />
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="label">Citas de hoy</div>
              <Link href="/agenda" className="text-xs font-medium" style={{ color: 'var(--teal)' }}>Ver agenda</Link>
            </div>
            {citasHoy.length === 0 ? (
              <div className="card text-center text-sm py-8" style={{ color: 'var(--muted)' }}>Sin citas para hoy</div>
            ) : (
              <div className="flex flex-col gap-2">
                {citasHoy.slice(0, 3).map(c => <CitaCard key={c.id} cita={c} onClick={() => setSelectedCita(c)} />)}
              </div>
            )}
          </div>
          <div className="mb-2">
            <div className="label mb-3">Acceso rápido</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/agenda', label: 'Nueva cita', color: '#e2a096', emoji: '📅' },
                { href: '/clientes', label: 'Nuevo cliente', color: '#34d399', emoji: '👤' },
                { href: '/cobros', label: 'Registrar pago', color: '#fbbf24', emoji: '💳' },
                { href: '/clientes', label: 'Ver clientes', color: '#f87171', emoji: '📋' },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="card flex items-center gap-3 transition-colors hover:bg-[var(--surface-2)]">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: item.color + '18' }}>
                    {item.emoji}
                  </div>
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
      <BottomSheet isOpen={!!selectedCita} onClose={() => setSelectedCita(null)} title="Detalle de cita">
        {selectedCita && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: 'rgba(226,160,150,0.14)', color: 'var(--teal)' }}>
                {selectedCita.clientes?.nombre?.[0] || '?'}
              </div>
              <div>
                <div className="font-semibold text-white">{selectedCita.clientes?.nombre}</div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>{selectedCita.servicio}</div>
              </div>
            </div>
            <div className="divider" />
            <div className="grid grid-cols-2 gap-4">
              <div><div className="label">Hora</div><div className="text-sm text-white">{formatTime(selectedCita.hora)}</div></div>
              <div>
                <div className="label">Estado</div>
                <span className={'badge ' + ESTADO_CONFIG[selectedCita.estado]?.bg + ' ' + ESTADO_CONFIG[selectedCita.estado]?.color + ' ' + ESTADO_CONFIG[selectedCita.estado]?.border}>
                  {ESTADO_CONFIG[selectedCita.estado]?.label}
                </span>
              </div>
              {selectedCita.clientes?.telefono && (
                <div>
                  <div className="label">Teléfono: <span className="text-white font-medium ml-1">{selectedCita.clientes.telefono}</span></div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <a 
                      href={getWhatsAppLink(selectedCita.clientes.nombre, selectedCita.clientes.telefono, selectedCita.fecha, selectedCita.hora, selectedCita.servicio)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="py-1 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors border border-green-500/20 text-green-400 hover:bg-green-500/10 bg-green-500/5"
                    >
                      💬 WhatsApp
                    </a>
                    <a 
                      href={'tel:' + selectedCita.clientes.telefono} 
                      className="py-1 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors border border-[var(--teal)]/20 text-[var(--teal)] hover:bg-[var(--teal)]/10 bg-[var(--teal)]/5"
                    >
                      📞 Llamar
                    </a>
                  </div>
                </div>
              )}
              {selectedCita.notas && <div className="col-span-2"><div className="label">Notas</div><div className="text-sm text-white">{selectedCita.notas}</div></div>}
            </div>
            <div className="divider" />
            <div className="flex flex-col gap-2">
              {selectedCita.estado === 'sin_confirmar' && (
                <button onClick={() => updateEstado(selectedCita.id, 'confirmada')} className="btn-primary w-full justify-center">
                  <CheckCircle size={15} /> Marcar confirmada
                </button>
              )}
              {selectedCita.estado === 'confirmada' && (
                <button onClick={() => updateEstado(selectedCita.id, 'completada')} className="btn-primary w-full justify-center">
                  <CheckCircle size={15} /> Marcar completada
                </button>
              )}
              <button onClick={() => updateEstado(selectedCita.id, 'cancelada')} className="btn-danger w-full justify-center" disabled={selectedCita.estado === 'cancelada' || selectedCita.estado === 'completada'}>
                <XCircle size={15} /> Marcar cancelada
              </button>
              <button onClick={() => sendRecordatorio(selectedCita)} className="btn-ghost w-full justify-center" disabled={selectedCita.recordatorio_enviado}>
                <Bell size={15} /> {selectedCita.recordatorio_enviado ? 'Recordatorio enviado' : 'Registrar recordatorio'}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </AppLayout>
  )
}