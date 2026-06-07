"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatMoney, formatDate, getTodayStr } from '@/lib/helpers'
import AppLayout from '@/components/layout/AppLayout'
import CobroBar from '@/components/ui/CobroBar'
import StatCard from '@/components/ui/StatCard'
import PageHeader from '@/components/ui/PageHeader'
import BottomSheet from '@/components/ui/BottomSheet'
import { useToast } from '@/components/ui/Toast'
import { Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function CobrosPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ cobradoMes: 0, pendiente: 0, cobradoHoy: 0 })
  const [serviciosPendientes, setServiciosPendientes] = useState([])
  const [cobrosRecientes, setCobrosRecientes] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [clientes, setClientes] = useState([])
  const [serviciosByCliente, setServiciosByCliente] = useState([])
  const [form, setForm] = useState({ cliente_id: '', servicio_realizado_id: '', monto: '', fecha: getTodayStr(), metodo_pago: 'efectivo', notes: '' })
  const [saving, setSaving] = useState(false)
  const today = getTodayStr()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const now = new Date()
    const firstOfMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01'
    const [r1, r2, r3, r4] = await Promise.all([
      supabase.from('cobros').select('monto').gte('fecha', firstOfMonth),
      supabase.from('cobros').select('monto').eq('fecha', today),
      supabase.from('servicios_realizados').select('*, clientes(nombre, activo), cobros(monto)').eq('activo', true),
      supabase.from('cobros').select('*, clientes(nombre, activo), servicios_realizados(nombre)').order('created_at', { ascending: false }).limit(12),
    ])
    const cobradoMes = (r1.data || []).reduce((s, c) => s + parseFloat(c.monto), 0)
    const cobradoHoy = (r2.data || []).reduce((s, c) => s + parseFloat(c.monto), 0)
    let pendiente = 0
    const pendServicios = []
    for (const t of r3.data || []) {
      if (t.clientes?.activo !== true) continue
      const ab = (t.cobros || []).reduce((s, c) => s + parseFloat(c.monto), 0)
      const p = Math.max(parseFloat(t.costo_total) - ab, 0)
      pendiente += p
      if (p > 0) pendServicios.push({ ...t, abonado: ab })
    }

    const clientWithDebtMap = {}
    for (const t of pendServicios) {
      if (t.cliente_id && t.clientes) {
        clientWithDebtMap[t.cliente_id] = t.clientes.nombre
      }
    }
    const clientWithDebtList = Object.entries(clientWithDebtMap)
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))

    setStats({ cobradoMes, pendiente, cobradoHoy })
    setServiciosPendientes(pendServicios)
    setCobrosRecientes(r4.data || [])
    setClientes(clientWithDebtList)
    setLoading(false)
  }

  async function loadServiciosByCliente(clienteId) {
    if (!clienteId) { setServiciosByCliente([]); return }
    const { data } = await supabase.from('servicios_realizados').select('id, nombre, costo_total, cobros(monto)').eq('cliente_id', clienteId).eq('activo', true)
    const pendingServicios = (data || []).filter(t => {
      const ab = (t.cobros || []).reduce((s, c) => s + parseFloat(c.monto), 0)
      return parseFloat(t.costo_total) - ab > 0
    })
    setServiciosByCliente(pendingServicios)
    setForm(f => ({ ...f, servicio_realizado_id: '' }))
  }

  async function saveCobro(e) {
    e.preventDefault()
    if (!form.cliente_id || !form.servicio_realizado_id || !form.monto) { toast('Completa todos los campos.', 'error'); return }
    setSaving(true)

    const selectedServ = serviciosByCliente.find(t => t.id === form.servicio_realizado_id)
    if (selectedServ) {
      const ab = (selectedServ.cobros || []).reduce((s, c) => s + parseFloat(c.monto), 0)
      const maxPermitido = parseFloat(selectedServ.costo_total) - ab
      if (parseFloat(form.monto) > maxPermitido) {
        toast(`El monto no puede superar el saldo pendiente de ${formatMoney(maxPermitido)}.`, 'error')
        setSaving(false)
        return
      }
    }

    const { error } = await supabase.from('cobros').insert({
      cliente_id: form.cliente_id, servicio_realizado_id: form.servicio_realizado_id,
      monto: parseFloat(form.monto), fecha: form.fecha, metodo_pago: form.metodo_pago, notes: form.notes,
    })
    setSaving(false)
    if (error) toast('Error al registrar el pago.', 'error')
    else { toast('Pago registrado exitosamente.', 'success'); setShowAdd(false); setForm({ cliente_id: '', servicio_realizado_id: '', monto: '', fecha: getTodayStr(), metodo_pago: 'efectivo', notes: '' }); setServiciosByCliente([]); loadAll() }
  }

  const metodos = [
    { val: 'efectivo', label: 'Efectivo', emoji: '💵' },
    { val: 'transferencia', label: 'Transfer', emoji: '🏦' },
    { val: 'tarjeta', label: 'Tarjeta', emoji: '💳' },
  ]

  return (
    <AppLayout>
      <PageHeader
        title="Cobros"
        subtitle="Control financiero"
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary py-2 px-3 text-sm">
            <Plus size={15} /> Pago
          </button>
        }
      />
      {loading ? (
        <div className="grid grid-cols-2 gap-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="col-span-2">
              <StatCard icon={TrendingUp} label="Cobrado este mes" value={formatMoney(stats.cobradoMes)} sub="Total de ingresos" color="#34d399" />
            </div>
            <StatCard icon={Clock} label="Por cobrar" value={formatMoney(stats.pendiente)} sub="Saldo pendiente" color="#f87171" />
            <StatCard icon={CheckCircle} label="Cobrado hoy" value={formatMoney(stats.cobradoHoy)} sub="Pagos del día" color="#e2a096" />
          </div>
          {serviciosPendientes.length > 0 && (
            <div className="mb-5">
              <div className="label mb-3">Servicios con saldo pendiente</div>
              <div className="flex flex-col gap-3">
                {serviciosPendientes.map(t => <CobroBar key={t.id} servicioRealizado={t} abonado={t.abonado} />)}
              </div>
            </div>
          )}
          <div>
            <div className="label mb-3">Pagos recientes</div>
            {cobrosRecientes.length === 0 ? (
              <div className="card text-center text-sm py-8" style={{ color: 'var(--muted)' }}>Sin pagos registrados.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {cobrosRecientes.map(c => (
                  <div key={c.id} className="card flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: 'rgba(74,222,128,0.1)' }}>
                      {c.metodo_pago === 'efectivo' ? '💵' : c.metodo_pago === 'transferencia' ? '🏦' : '💳'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{c.clientes?.nombre}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{c.servicios_realizados?.nombre} • {formatDate(c.fecha)}</div>
                    </div>
                    <div className="text-sm font-bold text-green-400 shrink-0">{formatMoney(c.monto)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="Registrar pago">
        <form onSubmit={saveCobro} className="flex flex-col gap-4 pb-2">
          <div>
            <label className="label">Cliente *</label>
            <select className="input" value={form.cliente_id} onChange={e => { setForm(f => ({ ...f, cliente_id: e.target.value })); loadServiciosByCliente(e.target.value) }}>
              <option value="">Selecciona un cliente</option>
              {clientes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Servicio *</label>
            <select className="input" value={form.servicio_realizado_id} onChange={e => setForm(f => ({ ...f, servicio_realizado_id: e.target.value }))} disabled={!form.cliente_id}>
              <option value="">Selecciona un servicio</option>
              {serviciosByCliente.map(t => <option key={t.id} value={t.id}>{t.nombre} — {formatMoney(t.costo_total)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Monto *</label>
              <input type="number" className="input" placeholder="0.00" step="0.01" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} />
              {form.servicio_realizado_id && (() => {
                const selectedServ = serviciosByCliente.find(t => t.id === form.servicio_realizado_id)
                if (!selectedServ) return null
                const ab = (selectedServ.cobros || []).reduce((s, c) => s + parseFloat(c.monto), 0)
                const pendiente = Math.max(parseFloat(selectedServ.costo_total) - ab, 0)
                return (
                  <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
                    Máximo: {formatMoney(pendiente)}
                  </div>
                )
              })()}
            </div>
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Método de pago *</label>
            <div className="flex gap-2">
              {metodos.map(m => (
                <button key={m.val} type="button" onClick={() => setForm(f => ({ ...f, metodo_pago: m.val }))}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1"
                  style={{ background: form.metodo_pago === m.val ? 'rgba(226,160,150,0.18)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (form.metodo_pago === m.val ? 'rgba(226,160,150,0.5)' : 'rgba(255,255,255,0.08)'), color: form.metodo_pago === m.val ? 'var(--teal)' : 'var(--muted)' }}>
                  <span className="text-base">{m.emoji}</span>{m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Notas (opcional)</label>
            <input type="text" className="input" placeholder="Ej. Abono inicial" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>{saving ? 'Registrando...' : 'Registrar pago'}</button>
        </form>
      </BottomSheet>
    </AppLayout>
  )
}