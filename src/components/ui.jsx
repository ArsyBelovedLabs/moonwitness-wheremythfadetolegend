import React from 'react'

export function Button({ variant='default', size='default', className='', children, ...props }) {
  return <button className={`ui-btn ui-btn-${variant} ui-btn-${size} ${className}`} {...props}>{children}</button>
}

export function Badge({ tone='neutral', children }) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>
}

export function Card({ className='', children }) {
  return <section className={`ui-card ${className}`}>{children}</section>
}

export function CardHeader({ children }) { return <div className="ui-card-header">{children}</div> }
export function CardTitle({ children }) { return <h3 className="ui-card-title">{children}</h3> }
export function CardDescription({ children }) { return <p className="ui-card-description">{children}</p> }

export function Sheet({ open, title, onClose, children }) {
  if (!open) return null
  return <div className="sheet-root" role="dialog" aria-modal="true" aria-label={title}>
    <div className="sheet-overlay" onClick={onClose} />
    <aside className="sheet-panel">
      <div className="sheet-header"><div><div className="eyebrow">DETAIL VIEW</div><h2>{title}</h2></div><Button variant="outline" size="icon" onClick={onClose} aria-label="Close">×</Button></div>
      <div className="sheet-content">{children}</div>
    </aside>
  </div>
}

export function Progress({ value=0, tone='accent' }) {
  return <div className="progress"><span className={`progress-fill progress-${tone}`} style={{width:`${Math.max(0,Math.min(100,value))}%`}} /></div>
}

export function EmptyState({ title='No data', description='' }) {
  return <div className="empty-state"><strong>{title}</strong><span>{description}</span></div>
}
