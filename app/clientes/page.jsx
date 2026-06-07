"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import ClienteCard from '@/components/ui/ClienteCard'
import PageHeader from '@/components/ui/PageHeader'
import BottomSheet from '@/components/ui/BottomSheet'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { Search, Plus, Users } from 'lucide-react'

export default function ClientesPage() {
  const toast = useToast()
  const router = useRouter()
  const [clientes, setClientes] = useState([])
  const [saldos, setSaldos] = useState({})
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', fecha_nacimiento: '', telefono: '', email: '', direccion: '', colonia: '', notas_preferencias: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const { data } = await supabase.from('clientes').select('*').eq('activo', true).order('nombre')
    setClientes(data || [])
    const { data: trats } = await supabase.from('servicios_realizados').select('id, cliente_id, costo_total, cobros(monto)').eq('activo', true)
    const sMap = {}
    for (const t of trats || []) {
      const ab = (t.cobros || []).reduce((s, c) => s + parseFloat(c.monto), 0)
      sMap[t.cliente_id] = (sMap[t.cliente_id] || 0) + Math.max(parseFloat(t.costo_total) - ab, 0)
    }
    setSaldos(sMap)
    setLoading(false)
  }

  const filtered = clientes.filter(p =>
    p.nombre.toLowerCase().includes(query.toLowerCase()) ||
    (p.colonia || '').toLowerCase().includes(query.toLowerCase())
  )

  async function saveCliente(e) {
    e.preventDefault()
    if (!form.nombre.trim()) { toast('El nombre es requerido.', 'error'); return }
    setSaving(true)
    
    const payload = {
      ...form,
      fecha_nacimiento: form.fecha_nacimiento || null
    }

    const { error } = await supabase.from('clientes').insert(payload)
    setSaving(false)
    if (error) toast('Error al guardar: ' + error.message, 'error')
    else {
      toast('Cliente registrado.', 'success')
      setShowAdd(false)
      setForm({ nombre: '', fecha_nacimiento: '', telefono: '', email: '', direccion: '', colonia: '', notas_preferencias: '' })
      loadAll()
    }
  }

  const F = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) })

  return (
    <AppLayout>
      <PageHeader
        title="Clientes"
        subtitle={clientes.length + ' registrados'}
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary py-2 px-3 text-sm">
            <Plus size={15} /> Nuevo
          </button>
        }
      />
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input type="text" className="input pl-9" placeholder="Buscar por nombre o colonia..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12" style={{ color: 'var(--muted)' }}>
          <Users size={32} className="mx-auto mb-3 opacity-30" />
          <div className="text-sm">{query ? 'Sin resultados.' : 'Sin clientes registrados.'}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(p => (
            <ClienteCard key={p.id} cliente={p} saldoPendiente={saldos[p.id] || 0} onClick={() => router.push('/clientes/' + p.id)} />
          ))}
        </div>
      )}
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nuevo cliente">
        <form onSubmit={saveCliente} className="flex flex-col gap-4 pb-2">
          <div><label className="label">Nombre completo *</label><input type="text" className="input" placeholder="Ej. María García López" {...F('nombre')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Fecha nacimiento</label><input type="date" className="input" {...F('fecha_nacimiento')} /></div>
            <div><label className="label">Teléfono</label><input type="tel" className="input" placeholder="686-000-0000" {...F('telefono')} /></div>
          </div>
          <div><label className="label">Email</label><input type="email" className="input" placeholder="correo@ejemplo.com" {...F('email')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Dirección</label><input type="text" className="input" placeholder="Calle y número" {...F('direccion')} /></div>
            <div><label className="label">Colonia</label><input type="text" className="input" placeholder="Colonia" {...F('colonia')} /></div>
          </div>
          <div>
            <label className="label">Preferencias de Estilismo / Fórmulas / Notas</label>
            <textarea className="input" rows={3} placeholder="Fórmulas de tinte, tipo de cabello, sensibilidades, etc." {...F('notas_preferencias')} />
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>{saving ? 'Guardando...' : 'Registrar cliente'}</button>
        </form>
      </BottomSheet>
    </AppLayout>
  )
}