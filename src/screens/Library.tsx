import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { img, seriesById, type Series } from '../data/catalog'
import { useStore } from '../store'

const SETTINGS: [IconName, string][] = [
  ['clock', 'Watch History'],
  ['card', 'Purchases & Subscriptions'],
  ['bell', 'Notifications'],
  ['help', 'Help & Support'],
]

export function Library() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'saved' | 'purchases'>('saved')
  const { saved, history, seasons, unlocked, vip } = useStore()
  const showToast = useStore.getState().showToast

  const purchasedIds = [...new Set([...seasons, ...Object.keys(unlocked)])]
  const ids = tab === 'saved' ? saved : purchasedIds
  const items = ids.map(seriesById).filter(Boolean) as Series[]

  return (
    <div className="scroll library">
      <header className="page-header between">
        <h1>My Library</h1>
        <button className="icon-btn" aria-label="Settings" onClick={() => nav('/profile')}>
          <Icon name="settings" size={22} />
        </button>
      </header>

      <div className="pad-x">
        <div className="profile-card">
          <img src={img('a-user')} alt="" />
          <div className="grow">
            <b>Sarah Connor</b>
            <small className="row gap-4">
              <Icon name="crown" size={14} /> {vip ? 'Premium Member' : 'Free plan'}
            </small>
          </div>
          <button className="btn-gradient-sm" onClick={() => nav('/vip')}>{vip ? 'Manage' : 'Go VIP'}</button>
        </div>

        <div className="segmented">
          <button className={tab === 'saved' ? 'on' : ''} onClick={() => setTab('saved')}>Saved</button>
          <button className={tab === 'purchases' ? 'on' : ''} onClick={() => setTab('purchases')}>Purchases</button>
        </div>

        {items.length === 0 ? (
          <div className="empty">
            <Icon name={tab === 'saved' ? 'bookmark' : 'unlock'} size={28} />
            <p>{tab === 'saved' ? 'Nothing saved yet. Tap ♡ on a show to keep it here.' : 'Episodes you unlock will appear here.'}</p>
            <Link to="/home" className="btn btn-glass">Browse shows</Link>
          </div>
        ) : (
          <div className="lib-grid">
            {items.map((s) => {
              const h = history.find((x) => x.seriesId === s.id)
              const ep = h?.ep ?? (s.id === 'the-ceo-and-i' ? 12 : 1)
              const done = s.id === 'second-chance-love'
              const locked = !vip && !seasons.includes(s.id) && ep > 3
              return (
                <Link key={s.id} to={`/series/${s.id}`} className="lib-card">
                  <div className="lib-img">
                    <img src={s.poster} alt="" loading="lazy" />
                    {done ? (
                      <span className="lib-badge dark">Completed</span>
                    ) : s.id === 'the-ceo-and-i' ? (
                      <span className="lib-badge">New Eps</span>
                    ) : locked ? (
                      <span className="lib-lock"><Icon name="lock" size={14} /></span>
                    ) : null}
                    <span className="lib-progress">Ep {done ? s.episodeCount : ep} / {s.episodeCount}</span>
                  </div>
                  <b>{s.title}</b>
                  <small className="row gap-4"><Icon name="heart" size={12} /> {s.tags[0]}</small>
                </Link>
              )
            })}
          </div>
        )}

        <h4 className="caps-title">Settings</h4>
        <div className="settings-list">
          {SETTINGS.map(([icon, label]) => (
            <button key={label} onClick={() => showToast(`${label} isn't part of this prototype`, 'info')}>
              <span className="settings-icon"><Icon name={icon} size={18} /></span>
              <span className="grow">{label}</span>
              <Icon name="chevron" size={18} />
            </button>
          ))}
        </div>
      </div>
      <div className="tabbar-spacer" />
    </div>
  )
}
