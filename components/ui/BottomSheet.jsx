"use client"
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 animate-fade-in" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div
        className="relative animate-slide-up w-full rounded-t-2xl"
        style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '92vh', maxWidth: 560, margin: '0 auto' }}
      >
        <div className="flex justify-center pt-3">
          <div className="w-9 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <h3 className="font-serif text-lg text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <X size={17} />
          </button>
        </div>
        <div className="divider mx-5 mt-0 mb-0" />
        <div className="overflow-y-auto px-5 pb-10 pt-4" style={{ maxHeight: 'calc(92vh - 110px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}