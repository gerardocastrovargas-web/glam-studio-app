"use client"
import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 340 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-toast pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
            style={{
              background: toast.type === 'success' ? 'rgba(74,222,128,0.14)' : 'rgba(248,113,113,0.14)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`,
              backdropFilter: 'blur(16px)',
              minWidth: 260,
            }}
          >
            {toast.type === 'success'
              ? <CheckCircle size={17} className="text-green-400 shrink-0" />
              : <XCircle size={17} className="text-red-400 shrink-0" />}
            <span className="text-sm font-medium text-white flex-1">{toast.message}</span>
            <button onClick={() => remove(toast.id)} className="text-white/40 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}