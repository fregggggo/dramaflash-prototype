import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { seriesById, type Series } from '../data/catalog'
import { useStore } from '../store'
import { Icon, type IconName } from './Icon'

export function StatusBar() {
  return (
    <div className="statusbar" aria-hidden>
      <span>9:41</span>
      <span className="statusbar-icons">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="6" rx="1" /><rect x="10" y="2.5" width="3" height="8.5" rx="1" /><rect x="15" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.1-1.1A10 10 0 0 0 8 .6 10 10 0 0 0 .9 3.5L2 4.6a8.5 8.5 0 0 1 6-2.4zm0 3.2c1.4 0 2.7.5 3.7 1.4l1.1-1.1A7 7 0 0 0 8 3.8a7 7 0 0 0-4.8 1.9l1.1 1.1c1-.9 2.3-1.4 3.7-1.4zM8 8.6c.6 0 1.1.2 1.5.6L8 10.7 6.5 9.2c.4-.4.9-.6 1.5-.6z" /></svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x=".5" y=".5" width="22" height="11" rx="3.5" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="19" height="8" rx="2" fill="currentColor" /><path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4z" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  )
}

const tabs: { to: string; label: string; icon: IconName }[] = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/discover', label: 'Discover', icon: 'compass' },
  { to: '/romance', label: 'Romance', icon: 'heart' },
  { to: '/library', label: 'Library', icon: 'bookmark' },
  { to: '/profile', label: 'Profile', icon: 'user' },
]

export function TabBar() {
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
          <Icon name={t.icon} size={24} stroke={1.8} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function ProBadge() {
  return (
    <span className="pro-badge">
      <Icon name="crown" size={11} stroke={2.2} /> PRO
    </span>
  )
}

export function PosterCard({ series, size = 'md', meta = true }: { series: Series; size?: 'md' | 'lg' | 'fill'; meta?: boolean }) {
  return (
    <Link to={`/series/${series.id}`} className={`poster-card poster-${size}`}>
      <div className="poster-img">
        <img src={series.poster} alt="" loading="lazy" />
        {series.pro && <ProBadge />}
        {meta && (
          <div className="poster-meta">
            <span>{series.episodeCount} Eps</span>
            <span>{series.minPerEp}/ep</span>
          </div>
        )}
      </div>
      <div className="poster-title">{series.title}</div>
    </Link>
  )
}

export function SectionHeader({ title, action, to }: { title: string; action?: string; to?: string }) {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      {action && (to ? <Link to={to} className="see-all">{action}</Link> : <span className="see-all">{action}</span>)}
    </div>
  )
}

export function Rail({ title, ids, action = 'See all' }: { title: string; ids: string[]; action?: string }) {
  const items = ids.map(seriesById).filter(Boolean) as Series[]
  if (!items.length) return null
  return (
    <section className="rail">
      <SectionHeader title={title} action={action} to="/romance" />
      <div className="rail-scroll">
        {items.map((s) => (
          <PosterCard key={s.id} series={s} />
        ))}
      </div>
    </section>
  )
}

export function CoinPill({ onClick }: { onClick?: () => void }) {
  const coins = useStore((s) => s.coins)
  return (
    <button className="coin-pill" onClick={onClick}>
      <Icon name="zap" size={14} stroke={2.4} />
      <motion.span key={coins} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {coins.toLocaleString('en')}
      </motion.span>
    </button>
  )
}

export function BackButton({ to }: { to?: string }) {
  const nav = useNavigate()
  return (
    <button className="icon-btn" aria-label="Back" onClick={() => (to ? nav(to) : window.history.length > 1 ? nav(-1) : nav('/home'))}>
      <Icon name="back" size={22} />
    </button>
  )
}

export function Sheet({
  open,
  onClose,
  children,
  className = '',
}: {
  open: boolean
  onClose?: () => void
  children: ReactNode
  className?: string
}) {
  const host = typeof document !== 'undefined' ? document.getElementById('screen') : null
  const tree = (
    <AnimatePresence>
      {open && (
        <motion.div className="sheet-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="sheet-backdrop" onClick={onClose} />
          <motion.div
            className={`sheet ${className}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose?.()
            }}
          >
            <div className="sheet-grabber" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
  return host ? createPortal(tree, host) : tree
}

export function PaySheet({
  open,
  title,
  subtitle,
  price,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  subtitle?: string
  price: string
  onConfirm: () => void
  onClose: () => void
}) {
  const [phase, setPhase] = useState<'idle' | 'processing' | 'done'>('idle')
  useEffect(() => {
    if (open) setPhase('idle')
  }, [open])

  const confirm = () => {
    setPhase('processing')
    setTimeout(() => setPhase('done'), 1100)
    setTimeout(() => {
      onConfirm()
    }, 1900)
  }

  return (
    <Sheet open={open} onClose={phase === 'idle' ? onClose : undefined} className="pay-sheet">
      <div className="pay-head">
        <span className="pay-store">App Store</span>
        <button className="pay-cancel" onClick={onClose} disabled={phase !== 'idle'}>
          Cancel
        </button>
      </div>
      <div className="pay-item">
        <span className="logo-mark sm">
          <Icon name="heart" size={18} stroke={2.4} />
        </span>
        <div>
          <div className="pay-title">{title}</div>
          {subtitle && <div className="pay-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="pay-row">
        <span>Account</span>
        <span>demo@dramaflash.app</span>
      </div>
      <div className="pay-row total">
        <span>Total</span>
        <span>{price}</span>
      </div>
      <button className="btn btn-primary btn-block" onClick={confirm} disabled={phase !== 'idle'}>
        <AnimatePresence mode="wait" initial={false}>
          {phase === 'idle' && (
            <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Confirm purchase
            </motion.span>
          )}
          {phase === 'processing' && (
            <motion.span key="p" className="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          )}
          {phase === 'done' && (
            <motion.span key="d" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="row gap-6">
              <Icon name="check" size={20} stroke={3} /> Done
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <p className="fine-print center">Demo only — no real payment is made.</p>
    </Sheet>
  )
}

export function ToastHost() {
  const toast = useStore((s) => s.toast)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <AnimatePresence>
      {visible && toast && (
        <motion.div
          key={toast.id}
          className={`toast toast-${toast.kind}`}
          initial={{ y: -30, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: -30, opacity: 0, x: '-50%' }}
        >
          <Icon name={toast.kind === 'info' ? 'sparkles' : 'checkCircle'} size={18} />
          {toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
