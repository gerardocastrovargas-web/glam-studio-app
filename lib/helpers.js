export function formatMoney(amount) {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const s = typeof dateStr === 'string' ? dateStr.split('T')[0] : dateStr
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

export function formatTime(timeStr) {
  if (!timeStr) return '—'
  return timeStr.substring(0, 5)
}

export function calcAge(birthDateStr) {
  if (!birthDateStr) return null
  const birth = new Date(birthDateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export const ESTADO_CONFIG = {
  confirmada: {
    label: 'Confirmada',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
  },
  sin_confirmar: {
    label: 'Sin confirmar',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
  },
  completada: {
    label: 'Completada',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
  },
  cancelada: {
    label: 'Cancelada',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
  },
}

export function getTodayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const r = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${r}`
}

export function getWeekDays(referenceDate = new Date()) {
  const days = []
  const day = referenceDate.getDay()
  const monday = new Date(referenceDate)
  monday.setDate(referenceDate.getDate() - ((day + 6) % 7))
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d)
  }
  return days
}

export function dateToStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDayName(date) {
  return date.toLocaleDateString('es-MX', { weekday: 'short' }).slice(0, 3).toUpperCase()
}

export function getWhatsAppLink(nombre, telefono, fecha, hora, servicio) {
  if (!telefono) return ''
  let cleaned = telefono.replace(/\D/g, '')
  if (cleaned.length === 10) {
    cleaned = '52' + cleaned
  }
  const dateStr = formatDate(fecha)
  const timeStr = hora ? hora.substring(0, 5) : ''
  const text = `Hola, ${nombre}. Te escribo de Glam Studio para confirmar tu cita de *${servicio}* el día *${dateStr}* a las *${timeStr}*. ¿Nos confirmas tu asistencia? ¡Muchas gracias!`
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`
}