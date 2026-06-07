"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatTime, getTodayStr, ESTADO_CONFIG, getWeekDays, dateToStr, getDayName, formatDate, getWhatsAppLink } from '@/lib/helpers'
import AppLayout from '@/components/layout/AppLayout'
import CitaCard from '@/components/ui/CitaCard'
import PageHeader from '@/components/ui/PageHeader'
import BottomSheet from '@/components/ui/BottomSheet'
import { useToast } from '@/components/ui/Toast'
import { ChevronLeft, ChevronRight, Plus, Bell, CheckCircle, XCircle, Calendar } from 'lucide-react'

function parseTime(timeStr) {
  if (!timeStr) return { h: '09', m: '00', ap: 'AM' }
  const [hStr, mStr] = timeStr.split(':')
  const h24 = parseInt(hStr || '9')
  const ap = h24 >= 12 ? 'PM' : 'AM'
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return {
    h: String(h12).padStart(2, '0'),
    m: mStr || '00',
    ap
  }
}

function joinTime(h, m, ap) {
  let hour = parseInt(h)
  if (ap === 'PM' && hour < 12) hour += 12
  if (ap === 'AM' && hour === 12) hour = 0
  return `${String(hour).padStart(2, '0')}:${m}:${String(0).padStart(2, '0')}`
}

export default function AgendaPage() {
  const toast = useToast()
  const [selectedDate, setSelectedDate] = useState(getTodayStr())
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekDays, setWeekDays] = useState([])
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCita, setSelectedCita] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({ cliente_id: '', hora: '09:00:00', servicio: '', estado: 'sin_confirmar', notas: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const ref = new Date()
    ref.setDate(ref.getDate() + weekOffset * 7)
    setWeekDays(getWeekDays(ref))
  }, [weekOffset])

  useEffect(() => { loadCitas() }, [selectedDate])
  useEffect(() => { loadClientes() }, [])

  async function loadCitas() {
    setLoading(true)
    const { data } = await supabase.from('citas').select('*, clientes(nombre, telefono, activo)').eq('fecha', selectedDate).order('hora')
    const activeCitas = (data || []).filter(c => c.clientes?.activo !== false)
    setCitas(activeCitas)
    setLoading(false)
  }

  async function loadClientes() {
    const { data } = await supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre')
    setClientes(data || [])
  }

  async function updateEstado(id, estado) {
    const { error } = await supabase.from('citas').update({ estado }).eq('id', id)
    if (error) toast('Error al actualizar el estado.', 'error')
    else { toast('Estado actualizado.', 'success'); setSelectedCita(null); loadCitas() }
  }

  async function sendRecordatorio(cita) {
    await supabase.from('citas').update({ recordatorio_enviado: true }).eq('id', cita.id)
    toast('Recordatorio registrado.', 'success')
    setSelectedCita(prev => prev ? { ...prev, recordatorio_enviado: true } : null)
    loadCitas()
  }

  async function saveCita(e) {
    e.preventDefault()
    if (!form.cliente_id || !form.hora || !form.servicio) { toast('Completa todos los campos.', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('citas').insert({ ...form, fecha: selectedDate })
    setSaving(false)
    if (error) toast('Error al guardar la cita.', 'error')
    else { toast('Cita agendada.', 'success'); setShowAdd(false); setForm({ cliente_id: '', hora: '09:00:00', servicio: '', estado: 'sin_confirmar', notas: '' }); loadCitas() }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Agenda"
        subtitle="Citas del salón"
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary py-2 px-3 text-sm">
            <Plus size={15} /> Nueva
          </button>
        }
      />
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--muted)' }}>
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            {weekDays[0] ? weekDays[0].toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) + ' — ' + weekDays[6]?.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) : ''}
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--muted)' }}>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex gap-1">
          {weekDays.map((day, i) => {
            const str = dateToStr(day)
            const isSelected = str === selectedDate
            const isToday = str === getTodayStr()
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(str)}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
                style={{ background: isSelected ? 'var(--teal)' : 'transparent', color: isSelected ? '#0d0c0f' : isToday ? 'var(--teal)' : 'var(--muted)' }}
              >
                <span className="text-[9px] font-bold">{getDayName(day)}</span>
                <span className="text-sm font-bold">{day.getDate()}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="label">{formatDate(selectedDate)}</div>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{citas.length} citas</span>
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}</div>
      ) : citas.length === 0 ? (
        <div className="card text-center py-12" style={{ color: 'var(--muted)' }}>
          <Calendar size={32} className="mx-auto mb-3 opacity-30" />
          <div className="text-sm">Sin citas para este día</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {citas.map(c => <CitaCard key={c.id} cita={c} onClick={() => setSelectedCita(c)} />)}
        </div>
      )}
      <BottomSheet isOpen={!!selectedCita} onClose={() => setSelectedCita(null)} title="Detalle de cita">
        {selectedCita && (
          <div className="flex flex-col gap-4 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <div><div className="label">Cliente</div><div className="text-sm font-semibold text-white">{selectedCita.clientes?.nombre}</div></div>
              <div><div className="label">Hora</div><div className="text-sm text-white">{formatTime(selectedCita.hora)}</div></div>
              <div className="col-span-2"><div className="label">Servicio</div><div className="text-sm text-white">{selectedCita.servicio}</div></div>
              <div>
                <div className="label">Estado</div>
                <span className={'badge ' + (ESTADO_CONFIG[selectedCita.estado]?.bg || '') + ' ' + (ESTADO_CONFIG[selectedCita.estado]?.color || '') + ' ' + (ESTADO_CONFIG[selectedCita.estado]?.border || '')}>
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
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nueva cita">
        <form onSubmit={saveCita} className="flex flex-col gap-4 pb-2">
          <div>
            <label className="label">Cliente *</label>
            <select className="input" value={form.cliente_id} onChange={e => setForm(p => ({ ...p, cliente_id: e.target.value }))}>
              <option value="">Selecciona un cliente</option>
              {clientes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Hora *</label>
            <div className="grid grid-cols-10 gap-2">
              <select className="col-span-4 input text-center" value={parseTime(form.hora).h} onChange={e => {
                const p = parseTime(form.hora)
                setForm(f => ({ ...f, hora: joinTime(e.target.value, p.m, p.ap) }))
              }}>
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <select className="col-span-4 input text-center" value={parseTime(form.hora).m} onChange={e => {
                const p = parseTime(form.hora)
                setForm(f => ({ ...f, hora: joinTime(p.h, e.target.value, p.ap) }))
              }}>
                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="col-span-2 input text-center" style={{ paddingLeft: '8px', paddingRight: '8px' }} value={parseTime(form.hora).ap} onChange={e => {
                const p = parseTime(form.hora)
                setForm(f => ({ ...f, hora: joinTime(p.h, p.m, e.target.value) }))
              }}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Servicio *</label>
            <input type="text" className="input" placeholder="Ej. Corte de cabello" value={form.servicio} onChange={e => setForm(p => ({ ...p, servicio: e.target.value }))} />
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input" value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
              <option value="sin_confirmar">Sin confirmar</option>
              <option value="confirmada">Confirmada</option>
            </select>
          </div>
          <div>
            <label className="label">Notas (opcional)</label>
            <textarea className="input" rows={3} placeholder="Observaciones..." value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>
            {saving ? 'Guardando...' : 'Agendar cita'}
          </button>
        </form>
      </BottomSheet>
    </AppLayout>
  )
}