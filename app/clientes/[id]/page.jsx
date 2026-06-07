"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatMoney, calcAge, ESTADO_CONFIG, getTodayStr } from '@/lib/helpers'
import AppLayout from '@/components/layout/AppLayout'
import CobroBar from '@/components/ui/CobroBar'
import BottomSheet from '@/components/ui/BottomSheet'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Plus, ClipboardList, Activity, DollarSign, Calendar } from 'lucide-react'

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

function getAttachedFiles(archivoUrl) {
  if (!archivoUrl) return []
  try {
    const parsed = JSON.parse(archivoUrl)
    if (Array.isArray(parsed)) return parsed
  } catch (e) {}
  return [archivoUrl]
}

async function compressImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file)
            }
            const compressedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, "") + ".jpg", 
              { type: 'image/jpeg', lastModified: Date.now() }
            )
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

export default function ClienteDetailPage({ params }) {
  const { id } = params
  const router = useRouter()
  const toast = useToast()
  const [cliente, setCliente] = useState(null)
  const [citas, setCitas] = useState([])
  const [servicios, setServicios] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [showEdit, setShowEdit] = useState(false)
  const [showAddServ, setShowAddServ] = useState(false)
  const [showAddHist, setShowAddHist] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [servForm, setServForm] = useState({ nombre: '', costo_total: '', notas: '' })
  const [histForm, setHistForm] = useState({ fecha: '', detalles_trabajo: '', estilista: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [showAddCobro, setShowAddCobro] = useState(false)
  const [selectedServForCobro, setSelectedServForCobro] = useState(null)
  const [cobroForm, setCobroForm] = useState({ monto: '', fecha: '', metodo_pago: 'efectivo', notes: '' })
  const [showAddCita, setShowAddCita] = useState(false)
  const [citaForm, setCitaForm] = useState({ fecha: '', hora: '09:00:00', servicio: '', estado: 'sin_confirmar', notas: '' })

  useEffect(() => { loadAll() }, [id])

  useEffect(() => {
    if (showAddCobro) {
      setCobroForm({ monto: '', fecha: getTodayStr(), metodo_pago: 'efectivo', notes: '' })
    }
  }, [showAddCobro])

  useEffect(() => {
    if (showAddCita) {
      setCitaForm({ fecha: getTodayStr(), hora: '09:00:00', servicio: '', estado: 'sin_confirmar', notas: '' })
    }
  }, [showAddCita])

  async function loadAll() {
    setLoading(true)
    const [cliRes, citasRes, servRes, histRes] = await Promise.all([
      supabase.from('clientes').select('*').eq('id', id).single(),
      supabase.from('citas').select('*').eq('cliente_id', id).order('fecha', { ascending: false }),
      supabase.from('servicios_realizados').select('*, cobros(monto)').eq('cliente_id', id).order('fecha', { ascending: false }),
      supabase.from('historial_estilismo').select('*').eq('cliente_id', id).order('fecha', { ascending: false }),
    ])
    if (cliRes.data) { setCliente(cliRes.data); setEditForm(cliRes.data) }
    setCitas(citasRes.data || [])
    setServicios(servRes.data || [])
    setHistorial(histRes.data || [])
    setLoading(false)
  }

  async function saveEdit(e) {
    e.preventDefault()
    if (!editForm.nombre?.trim()) { toast('El nombre es requerido.', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('clientes').update({
      nombre: editForm.nombre, 
      fecha_nacimiento: editForm.fecha_nacimiento || null, 
      telefono: editForm.telefono,
      email: editForm.email, 
      direccion: editForm.direccion, 
      colonia: editForm.colonia,
      notas_preferencias: editForm.notas_preferencias, 
    }).eq('id', id)
    setSaving(false)
    if (error) toast('Error al actualizar.', 'error')
    else { toast('Cliente actualizado.', 'success'); setShowEdit(false); loadAll() }
  }

  async function deleteCliente() {
    await supabase.from('clientes').update({ activo: false }).eq('id', id)
    toast('Cliente eliminado.', 'success')
    router.push('/clientes')
  }

  async function saveCobro(e) {
    e.preventDefault()
    if (!cobroForm.monto) { toast('El monto es requerido.', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('cobros').insert({
      cliente_id: id,
      servicio_realizado_id: selectedServForCobro.id,
      monto: parseFloat(cobroForm.monto),
      fecha: cobroForm.fecha,
      metodo_pago: cobroForm.metodo_pago,
      notes: cobroForm.notes
    })
    setSaving(false)
    if (error) {
      toast('Error al registrar abono: ' + error.message, 'error')
    } else {
      toast('Abono registrado exitosamente.', 'success')
      setShowAddCobro(false)
      loadAll()
    }
  }

  async function saveCita(e) {
    e.preventDefault()
    if (!citaForm.fecha || !citaForm.hora || !citaForm.servicio) { toast('Completa los campos requeridos.', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('citas').insert({
      cliente_id: id,
      fecha: citaForm.fecha,
      hora: citaForm.hora,
      servicio: citaForm.servicio,
      estado: citaForm.estado,
      notas: citaForm.notas
    })
    setSaving(false)
    if (error) {
      toast('Error al agendar cita: ' + error.message, 'error')
    } else {
      toast('Cita agendada exitosamente.', 'success')
      setShowAddCita(false)
      loadAll()
    }
  }

  async function saveServicio(e) {
    e.preventDefault()
    if (!servForm.nombre || !servForm.costo_total) { toast('Completa los campos requeridos.', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('servicios_realizados').insert({ ...servForm, cliente_id: id, costo_total: parseFloat(servForm.costo_total) })
    setSaving(false)
    if (error) toast('Error al guardar: ' + error.message, 'error')
    else { toast('Servicio registrado.', 'success'); setShowAddServ(false); setServForm({ nombre: '', costo_total: '', notas: '' }); loadAll() }
  }

  async function saveHistorial(e) {
    e.preventDefault()
    if (!histForm.detalles_trabajo || !histForm.fecha) { toast('Completa los campos requeridos.', 'error'); return }
    setSaving(true)

    let uploadedUrls = []
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        let fileToUpload = file
        if (file.type.startsWith('image/')) {
          try {
            fileToUpload = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 })
          } catch (err) {
            console.error("Error al comprimir imagen, subiendo original:", err)
          }
        }

        const fileExt = fileToUpload.name.split('.').pop()
        const fileName = `${id}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('expedientes')
          .upload(fileName, fileToUpload)
          
        if (uploadError) {
          toast(`Error al subir el archivo: ${file.name}`, 'error')
          setSaving(false)
          return
        }
        
        const { data: urlData } = supabase.storage
          .from('expedientes')
          .getPublicUrl(fileName)
          
        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl)
        }
      }
    }

    const archivoUrl = uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : null

    const { error } = await supabase.from('historial_estilismo').insert({ 
      ...histForm, 
      cliente_id: id,
      archivo_url: archivoUrl
    })
    setSaving(false)
    if (error) toast('Error al guardar: ' + error.message, 'error')
    else { 
      toast('Historial guardado exitosamente.', 'success')
      setShowAddHist(false)
      setSelectedFiles([])
      setHistForm({ fecha: '', detalles_trabajo: '', estilista: '' })
      loadAll() 
    }
  }

  async function deleteHistorial(hist) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta nota de historial?')) return
    
    if (hist.archivo_url) {
      const files = getAttachedFiles(hist.archivo_url)
      const filePaths = files.map(url => {
        const parts = url.split('/expedientes/')
        if (parts.length > 1) {
          const pathWithQuery = parts[1]
          const pathOnly = pathWithQuery.split('?')[0]
          return decodeURIComponent(pathOnly)
        }
        return null
      }).filter(Boolean)
      
      if (filePaths.length > 0) {
        await supabase.storage.from('expedientes').remove(filePaths)
      }
    }
    
    const { error } = await supabase.from('historial_estilismo').delete().eq('id', hist.id)
    if (error) {
      toast('Error al eliminar el registro.', 'error')
    } else {
      toast('Registro eliminado exitosamente.', 'success')
      loadAll()
    }
  }

  if (loading) return <AppLayout><div className="flex flex-col gap-3 pt-4"><div className="skeleton h-32" /><div className="skeleton h-24" /></div></AppLayout>
  if (!cliente) return <AppLayout><div className="card text-center py-10" style={{ color: 'var(--muted)' }}>Cliente no encontrado.</div></AppLayout>

  const totalAbonado = servicios.reduce((s, t) => s + (t.cobros || []).reduce((a, c) => a + parseFloat(c.monto), 0), 0)
  const totalServs = servicios.reduce((s, t) => s + parseFloat(t.costo_total), 0)
  const saldoPendiente = Math.max(totalServs - totalAbonado, 0)

  const tabs = [
    { id: 'info', label: 'Info', icon: ClipboardList },
    { id: 'citas', label: 'Citas', icon: Calendar },
    { id: 'servicios', label: 'Servicios', icon: DollarSign },
    { id: 'historial', label: 'Historial', icon: Activity },
  ]

  const EF = (key) => ({ value: editForm[key] || '', onChange: e => setEditForm(f => ({ ...f, [key]: e.target.value })) })

  return (
    <AppLayout>
      <div className="flex items-center gap-3 pt-2 mb-4">
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--muted)' }}><ArrowLeft size={20} /></button>
        <h1 className="font-serif text-xl text-white flex-1 truncate">{cliente.nombre}</h1>
        <button onClick={() => setShowEdit(true)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1"><Edit size={13} /> Editar</button>
      </div>
      <div className="card mb-4" style={{ borderColor: saldoPendiente > 0 ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)' }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0" style={{ background: 'rgba(226,160,150,0.14)', color: 'var(--teal)' }}>
            {cliente.nombre.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white">{cliente.nombre}</div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              {calcAge(cliente.fecha_nacimiento) ? calcAge(cliente.fecha_nacimiento) + ' años' : ''}
              {cliente.colonia ? ' • ' + cliente.colonia : ''}
            </div>
            {cliente.telefono && <a href={'tel:' + cliente.telefono} className="text-sm mt-1 block" style={{ color: 'var(--teal)' }}>{cliente.telefono}</a>}
          </div>
          <div className="text-right shrink-0">
            <div className="label">Saldo</div>
            <div className="text-sm font-bold" style={{ color: saldoPendiente > 0 ? '#f87171' : '#34d399' }}>{formatMoney(saldoPendiente)}</div>
          </div>
        </div>
        {cliente.notas_preferencias && (
          <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(226,160,150,0.1)', color: 'var(--teal)', border: '1px solid rgba(226,160,150,0.3)' }}>
            Preferencias: {cliente.notas_preferencias}
          </div>
        )}
      </div>
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: activeTab === tab.id ? 'var(--teal)' : 'transparent', color: activeTab === tab.id ? '#0d0c0f' : 'var(--muted)' }}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'info' && (
        <div className="card flex flex-col gap-4">
          {[{l:'Teléfono',v:cliente.telefono},{l:'Email',v:cliente.email},{l:'Nacimiento',v:formatDate(cliente.fecha_nacimiento)},{l:'Dirección',v:cliente.direccion},{l:'Colonia',v:cliente.colonia},{l:'Preferencias de Estilismo',v:cliente.notas_preferencias}].filter(f=>f.v).map(f=>(
            <div key={f.l}><div className="label">{f.l}</div><div className="text-sm text-white">{f.v}</div></div>
          ))}
          <div className="divider" />
          <button onClick={() => setConfirmDelete(true)} className="btn-danger w-full justify-center"><Trash2 size={14} /> Eliminar cliente</button>
        </div>
      )}
      {activeTab === 'citas' && (
        <div className="flex flex-col gap-2">
          <button onClick={() => setShowAddCita(true)} className="btn-primary w-full justify-center mb-1"><Plus size={15} /> Agendar cita</button>
          {citas.length === 0 ? <div className="card text-center text-sm py-8" style={{ color: 'var(--muted)' }}>Sin historial de citas.</div> : citas.map(cita => (
            <div key={cita.id} className="card flex items-center gap-3">
              <div className="text-xs shrink-0 w-20" style={{ color: 'var(--muted)' }}>{formatDate(cita.fecha)}</div>
              <div className="flex-1 min-w-0"><div className="text-sm font-medium text-white">{cita.servicio}</div><div className="text-xs" style={{ color: 'var(--muted)' }}>{cita.hora?.slice(0,5)}</div></div>
              <span className={'badge ' + (ESTADO_CONFIG[cita.estado]?.bg||'') + ' ' + (ESTADO_CONFIG[cita.estado]?.color||'') + ' ' + (ESTADO_CONFIG[cita.estado]?.border||'')} style={{ fontSize: 10 }}>{ESTADO_CONFIG[cita.estado]?.label}</span>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'servicios' && (
        <div className="flex flex-col gap-3">
          <button onClick={() => setShowAddServ(true)} className="btn-primary w-full justify-center"><Plus size={15} /> Registrar servicio realizado</button>
          {servicios.length === 0 ? <div className="card text-center text-sm py-8" style={{ color: 'var(--muted)' }}>Sin servicios registrados.</div> : servicios.map(t => {
            const ab = (t.cobros || []).reduce((s, c) => s + parseFloat(c.monto), 0)
            const pendiente = Math.max(parseFloat(t.costo_total) - ab, 0)
            const cobroAction = pendiente > 0 ? (
              <button 
                onClick={() => { setSelectedServForCobro(t); setShowAddCobro(true); }} 
                className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
              >
                <Plus size={12} /> Registrar abono
              </button>
            ) : null
            return <CobroBar key={t.id} servicioRealizado={{ ...t, clientes: { nombre: cliente.nombre } }} abonado={ab} action={cobroAction} />
          })}
        </div>
      )}
      {activeTab === 'historial' && (
        <div className="flex flex-col gap-3">
          <button onClick={() => setShowAddHist(true)} className="btn-primary w-full justify-center"><Plus size={15} /> Nueva nota de historial</button>
          {historial.length === 0 ? <div className="card text-center text-sm py-8" style={{ color: 'var(--muted)' }}>Sin notas de historial de estilismo.</div> : historial.map(hist => (
            <div key={hist.id} className="card flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>{formatDate(hist.fecha)}</div>
                <div className="flex items-center gap-2">
                  {hist.estilista && <span className="badge bg-purple-400/10 text-purple-400 border-purple-400/30" style={{ fontSize: 10 }}>Estilista: {hist.estilista}</span>}
                  <button 
                    onClick={() => deleteHistorial(hist)} 
                    className="p-1 rounded-md text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="text-sm font-medium text-white whitespace-pre-wrap">{hist.detalles_trabajo}</div>
              
              {hist.archivo_url && (() => {
                const files = getAttachedFiles(hist.archivo_url)
                if (files.length === 0) return null
                return (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className={files.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-2"}>
                      {files.map((url, index) => {
                        const cleanUrl = url.split('?')[0]
                        const isPdf = cleanUrl.toLowerCase().endsWith('.pdf')
                        return (
                          <div key={index} className="border border-white/5 rounded-lg overflow-hidden bg-white/5 relative group flex flex-col justify-center">
                            {isPdf ? (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 text-xs text-white/90 hover:text-teal-400 transition-colors">
                                📄 <span className="truncate font-medium flex-1 text-left">Ver PDF adjunto</span>
                              </a>
                            ) : (
                              <div className="relative w-full" style={{ height: files.length === 1 ? '180px' : '100px' }}>
                                <img src={url} alt={`Adjunto ${index + 1}`} className="w-full h-full object-cover" />
                                <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white gap-1.5">
                                  🔍 Ver imagen
                                </a>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      )}
      <BottomSheet isOpen={showEdit} onClose={() => setShowEdit(false)} title="Editar cliente">
        <form onSubmit={saveEdit} className="flex flex-col gap-4 pb-2">
          <div><label className="label">Nombre completo *</label><input type="text" className="input" {...EF('nombre')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Fecha de nacimiento</label><input type="date" className="input" {...EF('fecha_nacimiento')} /></div>
            <div><label className="label">Teléfono</label><input type="tel" className="input" {...EF('telefono')} /></div>
          </div>
          <div><label className="label">Email</label><input type="email" className="input" {...EF('email')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Dirección</label><input type="text" className="input" {...EF('direccion')} /></div>
            <div><label className="label">Colonia</label><input type="text" className="input" {...EF('colonia')} /></div>
          </div>
          <div>
            <label className="label">Preferencias de Estilismo / Fórmulas / Notas</label>
            <textarea className="input" rows={3} {...EF('notas_preferencias')} />
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        </form>
      </BottomSheet>
      <BottomSheet isOpen={showAddServ} onClose={() => setShowAddServ(false)} title="Registrar servicio realizado">
        <form onSubmit={saveServicio} className="flex flex-col gap-4 pb-2">
          <div><label className="label">Nombre del servicio *</label><input type="text" className="input" placeholder="Ej. Tinte completo + Peinado" value={servForm.nombre} onChange={e => setServForm(f => ({ ...f, nombre: e.target.value }))} /></div>
          <div><label className="label">Costo total *</label><input type="number" className="input" placeholder="0.00" step="0.01" value={servForm.costo_total} onChange={e => setServForm(f => ({ ...f, costo_total: e.target.value }))} /></div>
          <div><label className="label">Notas</label><textarea className="input" rows={3} placeholder="Detalles o especificaciones adicionales..." value={servForm.notes} onChange={e => setServForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>{saving ? 'Guardando...' : 'Registrar servicio'}</button>
        </form>
      </BottomSheet>
      <BottomSheet isOpen={showAddHist} onClose={() => { setShowAddHist(false); setSelectedFiles([]); }} title="Nueva nota de historial">
        <form onSubmit={saveHistorial} className="flex flex-col gap-4 pb-2">
          <div><label className="label">Fecha *</label><input type="date" className="input" value={histForm.fecha} onChange={e => setHistForm(f => ({ ...f, fecha: e.target.value }))} /></div>
          <div><label className="label">Estilista responsable</label><input type="text" className="input" placeholder="Nombre del estilista" value={histForm.estilista} onChange={e => setHistForm(f => ({ ...f, estilista: e.target.value }))} /></div>
          <div><label className="label">Detalles del trabajo / Fórmulas usadas *</label><textarea className="input" rows={5} placeholder="Ej. Fórmula: tinte 7.1 con oxidante de 20 vol, tiempo de pose 35 min..." value={histForm.detalles_trabajo} onChange={e => setHistForm(f => ({ ...f, detalles_trabajo: e.target.value }))} /></div>
          <div>
            <label className="label">Adjuntar imágenes / Fotos del resultado</label>
            <input 
              type="file" 
              className="input mb-2" 
              accept="image/*,application/pdf" 
              multiple 
              onChange={e => setSelectedFiles(Array.from(e.target.files || []))} 
            />
            {selectedFiles.length > 0 && (
              <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
                <div className="font-semibold text-white/70 mb-1">Archivos seleccionados:</div>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-white/90">
                    <span className="truncate flex-1">
                      {file.type.startsWith('image/') ? '🖼️' : '📄'} {file.name}
                    </span>
                    <button 
                      type="button" 
                      className="text-red-400 hover:text-red-300 font-bold px-1"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>{saving ? 'Guardando...' : 'Guardar en historial'}</button>
        </form>
      </BottomSheet>
      <BottomSheet isOpen={showAddCobro} onClose={() => setShowAddCobro(false)} title={`Registrar abono — ${selectedServForCobro?.nombre}`}>
        {selectedServForCobro && (
          <form onSubmit={saveCobro} className="flex flex-col gap-4 pb-2">
            <div>
              <label className="label">Monto a abonar *</label>
              <input 
                type="number" 
                className="input" 
                placeholder="0.00" 
                step="0.01" 
                max={Math.max(parseFloat(selectedServForCobro.costo_total) - (selectedServForCobro.cobros || []).reduce((s, c) => s + parseFloat(c.monto), 0), 0)}
                value={cobroForm.monto} 
                onChange={e => setCobroForm(f => ({ ...f, monto: e.target.value }))} 
              />
              <div className="text-[10px] mt-1 text-right" style={{ color: 'var(--muted)' }}>
                Máximo a abonar: {formatMoney(Math.max(parseFloat(selectedServForCobro.costo_total) - (selectedServForCobro.cobros || []).reduce((s, c) => s + parseFloat(c.monto), 0), 0))}
              </div>
            </div>
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input" value={cobroForm.fecha} onChange={e => setCobroForm(f => ({ ...f, fecha: e.target.value }))} />
            </div>
            <div>
              <label className="label">Método de pago *</label>
              <div className="flex gap-2">
                {[
                  { val: 'efectivo', label: 'Efectivo', emoji: '💵' },
                  { val: 'transferencia', label: 'Transfer', emoji: '🏦' },
                  { val: 'tarjeta', label: 'Tarjeta', emoji: '💳' },
                ].map(m => (
                  <button key={m.val} type="button" onClick={() => setCobroForm(f => ({ ...f, metodo_pago: m.val }))}
                    className="flex-1 py-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1"
                    style={{ 
                      background: cobroForm.metodo_pago === m.val ? 'rgba(226,160,150,0.18)' : 'rgba(255,255,255,0.04)', 
                      border: '1px solid ' + (cobroForm.metodo_pago === m.val ? 'rgba(226,160,150,0.5)' : 'rgba(255,255,255,0.08)'), 
                      color: cobroForm.metodo_pago === m.val ? 'var(--teal)' : 'var(--muted)' 
                    }}
                  >
                    <span className="text-base">{m.emoji}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Notas (opcional)</label>
              <input type="text" className="input" placeholder="Ej. Pago parcial" value={cobroForm.notes} onChange={e => setCobroForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>{saving ? 'Registrando...' : 'Registrar abono'}</button>
          </form>
        )}
      </BottomSheet>
      <BottomSheet isOpen={showAddCita} onClose={() => setShowAddCita(false)} title="Nueva cita">
        <form onSubmit={saveCita} className="flex flex-col gap-4 pb-2">
          <div>
            <label className="label">Fecha *</label>
            <input type="date" className="input" value={citaForm.fecha} onChange={e => setCitaForm(f => ({ ...f, fecha: e.target.value }))} />
          </div>
          <div>
            <label className="label">Hora *</label>
            <div className="grid grid-cols-10 gap-2">
              <select className="col-span-4 input text-center" value={parseTime(citaForm.hora).h} onChange={e => {
                const p = parseTime(citaForm.hora)
                setCitaForm(f => ({ ...f, hora: joinTime(e.target.value, p.m, p.ap) }))
              }}>
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <select className="col-span-4 input text-center" value={parseTime(citaForm.hora).m} onChange={e => {
                const p = parseTime(citaForm.hora)
                setCitaForm(f => ({ ...f, hora: joinTime(p.h, e.target.value, p.ap) }))
              }}>
                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="col-span-2 input text-center" style={{ paddingLeft: '8px', paddingRight: '8px' }} value={parseTime(citaForm.hora).ap} onChange={e => {
                const p = parseTime(citaForm.hora)
                setCitaForm(f => ({ ...f, hora: joinTime(p.h, p.m, e.target.value) }))
              }}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Servicio *</label>
            <input type="text" className="input" placeholder="Ej. Corte de cabello" value={citaForm.servicio} onChange={e => setCitaForm(f => ({ ...f, servicio: e.target.value }))} />
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input" value={citaForm.estado} onChange={e => setCitaForm(f => ({ ...f, estado: e.target.value }))}>
              <option value="sin_confirmar">Sin confirmar</option>
              <option value="confirmada">Confirmada</option>
            </select>
          </div>
          <div>
            <label className="label">Notas (opcional)</label>
            <textarea className="input" rows={3} placeholder="Observaciones..." value={citaForm.notas} onChange={e => setCitaForm(f => ({ ...f, notas: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={saving}>
            {saving ? 'Agendando...' : 'Agendar cita'}
          </button>
        </form>
      </BottomSheet>
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="card w-full" style={{ maxWidth: 340 }}>
            <h3 className="font-serif text-lg text-white mb-2">¿Eliminar cliente?</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>El cliente será marcado como inactivo. Esta acción no puede deshacerse.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={deleteCliente} className="btn-danger flex-1">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}