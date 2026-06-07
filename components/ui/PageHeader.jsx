export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5 pt-2">
      <div>
        <h1 className="font-serif text-2xl text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{subtitle}</p>}
      </div>
      {action && <div className="ml-3 shrink-0">{action}</div>}
    </div>
  )
}