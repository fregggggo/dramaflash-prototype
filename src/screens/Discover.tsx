import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { fmtTime, getEpisode, seriesById, type Series } from '../data/catalog'
import { useIsUnlocked, useStore } from '../store'

const FEED: [string, number][] = [
  ['billionaires-secret', 1],
  ['billionaires-secret', 5],
  ['billionaires-secret', 6],
  ['verbotene-liebe', 1],
  ['schattenkuss', 1],
  ['ceos-secret-life', 4],
  ['racheengel', 1],
  ['royal-contract', 8],
]

export function Discover() {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { root, threshold: 0.6 },
    )
    root.querySelectorAll('[data-i]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="feed" ref={ref}>
      <div className="feed-tabs">
        <span>Following</span>
        <span className="on">For You</span>
      </div>
      {FEED.map(([sid, n], i) => {
        const s = seriesById(sid)
        return s ? <FeedCard key={`${sid}-${n}`} series={s} n={n} i={i} active={i === active} /> : null
      })}
    </div>
  )
}

function FeedCard({ series, n, i, active }: { series: Series; n: number; i: number; active: boolean }) {
  const nav = useNavigate()
  const ep = getEpisode(series, n)
  const unlocked = useIsUnlocked(series.id, n)
  const key = `${series.id}:${n}`
  const liked = useStore((s) => s.liked.includes(key))
  const { openUnlock, toggleLiked, showToast } = useStore.getState()

  return (
    <section className={'feed-card' + (unlocked ? '' : ' is-locked')} data-i={i}>
      <motion.img
        src={ep.frame}
        alt=""
        className="feed-bg"
        animate={active ? { scale: [1, 1.08] } : { scale: 1 }}
        transition={{ duration: 12, ease: 'linear' }}
      />
      <div className="feed-shade" />

      {!unlocked && (
        <button className="locked-card" onClick={() => openUnlock(series.id, n, 'feed')}>
          <span className="locked-icon">
            <Icon name="lock" size={30} stroke={1.8} />
            <span className="locked-coin"><Icon name="zap" size={11} stroke={2.6} /></span>
          </span>
          Unlock Episode {n}
        </button>
      )}

      <div className="side-actions feed-actions">
        <button className={'side-btn' + (liked ? ' on' : '')} onClick={() => toggleLiked(key)}>
          <span><Icon name={liked ? 'heartFill' : 'heart'} size={22} /></span>
          {liked ? '12.1K' : '12K'}
        </button>
        <button className="side-btn" onClick={() => showToast('Comments are coming soon', 'info')}>
          <span><Icon name="message" size={20} /></span>342
        </button>
        <button className="side-btn" onClick={() => showToast('Link copied', 'info')}>
          <span><Icon name="share" size={20} /></span>Share
        </button>
      </div>

      <div className="feed-info">
        <h2 onClick={() => nav(`/series/${series.id}`)}>{series.title}</h2>
        <div className="player-meta">
          <span className="ep-tag">Ep {n}</span>
          <span>•</span>
          <span>{fmtTime(ep.duration)}</span>
        </div>
        <button
          className="btn btn-watch"
          onClick={() => (unlocked ? nav(`/watch/${series.id}/${n}`) : openUnlock(series.id, n, 'feed'))}
        >
          <Icon name="play" size={18} /> Watch
        </button>
      </div>
    </section>
  )
}
