import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Sheet } from '../components/ui'
import { fmtTime, getEpisode, getEpisodes, seriesById, type Episode, type Series } from '../data/catalog'
import { useIsUnlocked, useStore } from '../store'

const DEMO_SECONDS = 22
const CLIFF_AT = 0.78

export function Player() {
  const { seriesId = '', ep: epParam = '1' } = useParams()
  const series = seriesById(seriesId)
  const n = Math.max(1, Number(epParam) || 1)
  if (!series || n > series.episodeCount) return <Navigate to="/home" replace />
  return <EpisodePlayer key={`${series.id}-${n}`} series={series} n={n} />
}

function EpisodePlayer({ series, n }: { series: Series; n: number }) {
  const nav = useNavigate()
  const location = useLocation()
  const ep = getEpisode(series, n)
  const unlocked = useIsUnlocked(series.id, n)
  const nextUnlocked = useIsUnlocked(series.id, n + 1)
  const hasNext = n < series.episodeCount
  const { openUnlock, setWatched, track, toggleLiked } = useStore.getState()
  const liked = useStore((s) => s.liked.includes(`${series.id}:${n}`))
  const sheetOpen = useStore((s) => !!s.unlockFor)

  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [ended, setEnded] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const cliff = progress >= CLIFF_AT
  const fromCliff = (location.state as { from?: string } | null)?.from === 'cliffhanger'

  const paused = !playing || listOpen || sheetOpen || ended

  useEffect(() => {
    if (!unlocked || paused) return
    let last = performance.now()
    const iv = setInterval(() => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      setProgress((p) => {
        const np = Math.min(1, p + dt / DEMO_SECONDS)
        if (np >= 1) setEnded(true)
        return np
      })
    }, 50)
    return () => clearInterval(iv)
  }, [unlocked, paused])

  const started = useRef(false)
  useEffect(() => {
    if (unlocked && !started.current) {
      started.current = true
      setWatched(series.id, n)
      track('episode_start', { series: series.id, ep: n })
    }
  }, [unlocked, series.id, n, setWatched, track])

  const cliffFired = useRef(false)
  useEffect(() => {
    if (cliff && !cliffFired.current) {
      cliffFired.current = true
      navigator.vibrate?.([40, 80, 40])
      track('cliffhanger_reached', { series: series.id, ep: n })
    }
  }, [cliff, series.id, n, track])

  const goTo = useCallback(
    (target: number, from?: string) => {
      if (target < 1 || target > series.episodeCount) return
      nav(`/watch/${series.id}/${target}`, { replace: true, state: from ? { from } : undefined })
    },
    [nav, series.id, series.episodeCount],
  )

  useEffect(() => {
    if (!ended) return
    track('episode_complete', { series: series.id, ep: n })
    if (!hasNext) return
    if (!nextUnlocked) {
      const t = setTimeout(() => goTo(n + 1, 'cliffhanger'), 1600)
      return () => clearTimeout(t)
    }
    setCountdown(3)
    const iv = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(iv)
  }, [ended, hasNext, nextUnlocked, goTo, n, series.id, track])

  useEffect(() => {
    if (ended && nextUnlocked && countdown <= 0) goTo(n + 1)
  }, [countdown, ended, nextUnlocked, goTo, n])

  const autoOpened = useRef(false)
  useEffect(() => {
    if (unlocked || autoOpened.current) return
    const t = setTimeout(() => {
      autoOpened.current = true
      openUnlock(series.id, n, fromCliff ? 'cliffhanger' : 'player')
    }, fromCliff ? 700 : 250)
    return () => clearTimeout(t)
  }, [unlocked, series.id, n, openUnlock, fromCliff])

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const p = Math.min(0.999, Math.max(0, (e.clientX - rect.left) / rect.width))
    setProgress(p)
    setEnded(false)
  }

  const lineIdx = Math.min(ep.lines.length - 1, Math.floor((progress / CLIFF_AT) * ep.lines.length))
  const subtitle = !unlocked ? null : cliff ? ep.cliff : progress > 0.03 ? ep.lines[lineIdx] : null

  return (
    <div className="player">
      <motion.div
        className="player-stage"
        onPanEnd={(_, info) => {
          if (Math.abs(info.offset.y) < 70 || Math.abs(info.offset.x) > Math.abs(info.offset.y)) return
          if (info.offset.y < 0) goTo(n + 1)
          else goTo(n - 1)
        }}
        onTap={() => unlocked && !ended && setPlaying((p) => !p)}
      >
        <motion.img
          src={ep.frame}
          alt=""
          className={'player-bg' + (unlocked ? '' : ' locked')}
          initial={{ scale: 1.05 }}
          animate={{ scale: cliff ? 1.32 : 1.18, x: cliff ? 0 : n % 2 ? -14 : 14 }}
          transition={{ duration: cliff ? DEMO_SECONDS * (1 - CLIFF_AT) : DEMO_SECONDS, ease: 'linear' }}
          style={{ transformOrigin: `${30 + ((n * 23) % 40)}% 40%` }}
        />
        <div className="player-shade" />
        <AnimatePresence>
          {cliff && unlocked && (
            <motion.div
              className="cliff-vignette"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.6, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            />
          )}
        </AnimatePresence>

        <div className="subtitle-zone">
          <AnimatePresence mode="wait">
            {subtitle && (
              <motion.p
                key={subtitle}
                className={'subtitle' + (cliff ? ' cliff' : '')}
                initial={{ opacity: 0, y: 8, scale: cliff ? 1.15 : 1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: cliff ? 0.6 : 0.25 }}
              >
                {subtitle}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {unlocked && !playing && !ended && (
            <motion.div className="big-play" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.3, opacity: 0 }}>
              <Icon name="playFill" size={34} />
            </motion.div>
          )}
        </AnimatePresence>

        {!unlocked && <LockedCard n={n} onUnlock={() => openUnlock(series.id, n, 'player')} />}
      </motion.div>

      <div className="player-top">
        <button className="icon-btn glass" aria-label="Back" onClick={() => nav(`/series/${series.id}`)}>
          <Icon name="back" size={22} />
        </button>
        <div className="player-top-title">
          <span>{series.title}</span>
          <small>Episode {n} / {series.episodeCount}</small>
        </div>
        <button className="icon-btn glass" aria-label="All episodes" onClick={() => setListOpen(true)}>
          <Icon name="grid" size={20} />
        </button>
      </div>

      <div className="side-actions">
        <button className={'side-btn' + (liked ? ' on' : '')} onClick={() => toggleLiked(`${series.id}:${n}`)}>
          <span><Icon name={liked ? 'heartFill' : 'heart'} size={22} /></span>
          {liked ? '12.1K' : '12K'}
        </button>
        <button className="side-btn" onClick={() => useStore.getState().showToast('Comments are coming soon', 'info')}>
          <span><Icon name="message" size={20} /></span>342
        </button>
        <button className="side-btn" onClick={() => setListOpen(true)}>
          <span><Icon name="list" size={20} /></span>Episodes
        </button>
        <button className="side-btn" onClick={() => useStore.getState().showToast('Link copied', 'info')}>
          <span><Icon name="share" size={20} /></span>Share
        </button>
      </div>

      <div className="player-bottom">
        <h2 className="player-title">{ep.title}</h2>
        <div className="player-meta">
          <span className="ep-tag">Ep {n}</span>
          <span>•</span>
          <span>{fmtTime(ep.duration)}</span>
          {n <= 3 && <span className="free-tag">Free</span>}
        </div>
        <div className="progress" onPointerDown={unlocked ? seek : undefined}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
            <div className="progress-cliff" style={{ left: `${CLIFF_AT * 100}%` }} title="Cliffhanger" />
            <div className="progress-knob" style={{ left: `${progress * 100}%` }} />
          </div>
          <div className="progress-times">
            <span>{fmtTime(progress * ep.duration)}</span>
            <span>-{fmtTime((1 - progress) * ep.duration)}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {ended && (
          <motion.div className="end-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!hasNext ? (
              <div className="end-card">
                <div className="eyebrow">Season finale</div>
                <h3>You watched them all!</h3>
                <button className="btn btn-primary" onClick={() => nav('/home')}>Discover more</button>
              </div>
            ) : nextUnlocked ? (
              <div className="end-card">
                <div className="eyebrow">Up next in {Math.max(0, countdown)}</div>
                <h3>Episode {n + 1} · {getEpisode(series, n + 1).title}</h3>
                <div className="row gap-8">
                  <button className="btn btn-glass" onClick={() => { setProgress(0); setEnded(false) }}>
                    <Icon name="refresh" size={18} /> Replay
                  </button>
                  <button className="btn btn-primary" onClick={() => goTo(n + 1)}>
                    <Icon name="playFill" size={18} /> Play now
                  </button>
                </div>
              </div>
            ) : (
              <motion.div className="tbc" initial={{ scale: 1.3, opacity: 0, letterSpacing: '0.4em' }} animate={{ scale: 1, opacity: 1, letterSpacing: '0.12em' }} transition={{ duration: 0.9 }}>
                To be continued…
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <EpisodeGrid open={listOpen} series={series} current={n} onClose={() => setListOpen(false)} onPick={(k) => { setListOpen(false); goTo(k) }} />
    </div>
  )
}

function LockedCard({ n, onUnlock }: { n: number; onUnlock: () => void }) {
  return (
    <motion.button
      className="locked-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={(e) => {
        e.stopPropagation()
        onUnlock()
      }}
    >
      <span className="locked-icon">
        <Icon name="lock" size={30} stroke={1.8} />
        <span className="locked-coin"><Icon name="zap" size={11} stroke={2.6} /></span>
      </span>
      Unlock Episode {n}
      <small>Tap to continue the story</small>
    </motion.button>
  )
}

function EpisodeGrid({
  open,
  series,
  current,
  onClose,
  onPick,
}: {
  open: boolean
  series: Series
  current: number
  onClose: () => void
  onPick: (n: number) => void
}) {
  const state = useStore()
  const eps: Episode[] = getEpisodes(series)
  return (
    <Sheet open={open} onClose={onClose} className="episodes-sheet">
      <div className="episodes-head">
        <div>
          <h3>{series.title}</h3>
          <small>{series.episodeCount} episodes · {series.minPerEp}/ep</small>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={20} /></button>
      </div>
      <div className="ep-grid">
        {eps.map((e) => {
          const ok = state.isUnlocked(series.id, e.n)
          return (
            <button key={e.n} className={'ep-cell' + (e.n === current ? ' current' : '') + (ok ? '' : ' locked')} onClick={() => onPick(e.n)}>
              {e.n}
              {!ok && <Icon name="lock" size={10} stroke={2.6} className="ep-cell-lock" />}
              {e.n === current && <span className="ep-cell-eq"><i /><i /><i /></span>}
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
