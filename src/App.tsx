import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './components/Icon'
import { StatusBar, TabBar, ToastHost } from './components/ui'
import { UnlockSheet } from './components/UnlockSheet'
import { CoinStore } from './screens/CoinStore'
import { Discover } from './screens/Discover'
import { Home } from './screens/Home'
import { Library } from './screens/Library'
import { Login } from './screens/Login'
import { Player } from './screens/Player'
import { Profile } from './screens/Profile'
import { Romance } from './screens/Romance'
import { SeriesDetail } from './screens/SeriesDetail'
import { Vip } from './screens/Vip'
import { DAILY_BONUS, useStore } from './store'

const TAB_ROUTES = ['/home', '/discover', '/romance', '/library', '/profile']

export default function App() {
  return (
    <HashRouter>
      <div className="page">
        <GuidePanel />
        <div className="device">
          <div className="device-screen" id="screen">
            <StatusBar />
            <Screens />
            <UnlockSheet />
            <ToastHost />
            <div className="home-indicator" />
          </div>
        </div>
        <EventsPanel />
      </div>
    </HashRouter>
  )
}

function Screens() {
  const location = useLocation()
  const authed = useStore((s) => s.authed)

  useEffect(() => {
    if (!authed) return
    const t = setTimeout(() => {
      if (useStore.getState().claimDailyBonus()) useStore.getState().showToast(`Daily bonus: +${DAILY_BONUS} coins`)
    }, 900)
    return () => clearTimeout(t)
  }, [authed])
  const showTabs = TAB_ROUTES.includes(location.pathname) || location.pathname.startsWith('/series/')
  const animKey = location.pathname.startsWith('/watch/') ? '/watch' : location.pathname

  const guard = (el: JSX.Element) => (authed ? el : <Navigate to="/" replace />)

  return (
    <>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={animKey}
          className="route"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={authed ? <Navigate to="/home" replace /> : <Login />} />
            <Route path="/home" element={guard(<Home />)} />
            <Route path="/discover" element={guard(<Discover />)} />
            <Route path="/romance" element={guard(<Romance />)} />
            <Route path="/library" element={guard(<Library />)} />
            <Route path="/profile" element={guard(<Profile />)} />
            <Route path="/series/:seriesId" element={guard(<SeriesDetail />)} />
            <Route path="/watch/:seriesId/:ep" element={guard(<Player />)} />
            <Route path="/store" element={guard(<CoinStore />)} />
            <Route path="/vip" element={guard(<Vip />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {showTabs && <TabBar />}
    </>
  )
}

function GuidePanel() {
  const nav = useNavigate()
  const authed = useStore((s) => s.authed)
  const steps: { label: string; hint: string; to: string }[] = [
    { label: 'Home feed', hint: 'Hero carousel, genre chips, rails', to: '/home' },
    { label: 'Series page', hint: 'Episodes 1–3 free, 4+ locked', to: '/series/ceos-secret-life' },
    { label: 'Watch Episode 3', hint: 'Cliffhanger → Episode 4 locks', to: '/watch/ceos-secret-life/3' },
    { label: 'Swipe feed', hint: 'TikTok-style episodes with locks', to: '/discover' },
    { label: 'Coin store', hint: 'UI only — purchases are disabled in beta', to: '/store' },
    { label: 'VIP paywall', hint: 'Subscription unlock', to: '/vip' },
  ]
  return (
    <aside className="side-panel guide">
      <div className="side-brand">
        <span className="logo-mark sm"><Icon name="heart" size={18} stroke={2.4} /></span>
        DramaFlash <span className="beta">Beta mock-up</span>
      </div>
      <h2>Clickable prototype</h2>
      <p>
        Home feed → player → cliffhanger → episode lock → unlock with <b>coins</b>, <b>subscription</b> or a <b>rewarded ad</b>.
        State (coins, unlocks, VIP) is persisted locally.
      </p>
      <h3>Jump to a step</h3>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={s.to}>
            <button
              onClick={() => {
                if (!authed) useStore.getState().signIn('guide')
                nav(s.to)
              }}
            >
              <span className="step-n">{i + 1}</span>
              <span>
                <b>{s.label}</b>
                <small>{s.hint}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="side-tips">
        <p><Icon name="sparkles" size={14} /> Tip: tap the progress bar to jump to the cliffhanger.</p>
        <p><Icon name="refresh" size={14} /> Profile → “Reset demo state” to start over.</p>
      </div>
    </aside>
  )
}

function EventsPanel() {
  const events = useStore((s) => s.events)
  const coins = useStore((s) => s.coins)
  const vip = useStore((s) => s.vip)
  const reset = useStore((s) => s.resetDemo)
  return (
    <aside className="side-panel events">
      <div className="events-head">
        <h3>Analytics events</h3>
        <button className="link" onClick={reset}>Reset demo</button>
      </div>
      <div className="state-row">
        <span><Icon name="zap" size={14} /> {coins} coins</span>
        <span><Icon name="crown" size={14} /> {vip ? 'VIP' : 'Free'}</span>
      </div>
      <ul className="event-list">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.li key={e.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <code className={'ev-' + e.name.split('_')[0]}>{e.name}</code>
              {e.props && (
                <span className="ev-props">
                  {Object.entries(e.props).map(([k, v]) => `${k}=${v}`).join(' · ')}
                </span>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
        {events.length === 0 && <li className="ev-empty">Interact with the app to see paywall / unlock funnel events.</li>}
      </ul>
    </aside>
  )
}
