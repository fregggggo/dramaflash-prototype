import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, Logo } from '../components/Icon'
import { Rail } from '../components/ui'
import { getEpisode, img, RAILS, seriesById, SERIES, type Genre, type Series } from '../data/catalog'
import { useStore } from '../store'

const CHIPS: ('All' | Genre)[] = ['All', 'Romance', 'Drama', 'Action', 'Mystery', 'Billionaire', 'Fantasy']

export function Home() {
  const [chip, setChip] = useState<(typeof CHIPS)[number]>('All')
  const history = useStore((s) => s.history)

  const genreIds = useMemo(() => (chip === 'All' ? [] : SERIES.filter((s) => s.genres.includes(chip)).map((s) => s.id)), [chip])

  return (
    <div className="scroll home">
      <header className="home-header">
        <Logo />
        <div className="row gap-16">
          <button className="icon-btn" aria-label="Search" onClick={() => useStore.getState().showToast('Search is not part of this prototype', 'info')}>
            <Icon name="search" size={22} />
          </button>
          <button className="icon-btn has-dot" aria-label="Notifications" onClick={() => useStore.getState().showToast('New episode of Verbotene Liebe is out!', 'info')}>
            <Icon name="bell" size={22} />
          </button>
          <Link to="/profile" className="avatar-sm">
            <img src={img('a-avatar')} alt="Profile" />
          </Link>
        </div>
      </header>

      <Hero />

      <div className="chips">
        {CHIPS.map((c) => (
          <button key={c} className={'chip' + (c === chip ? ' active' : '')} onClick={() => setChip(c)}>
            {c}
          </button>
        ))}
      </div>

      {history.length > 0 && chip === 'All' && <ContinueWatching />}

      {chip === 'All' ? (
        <>
          <h2 className="genre-title grad-text">Romance</h2>
          <Rail title="Trending Romance" ids={RAILS.trending} />
          <Rail title="Forbidden Love" ids={RAILS.forbidden} />
          <h2 className="genre-title">Popular micro dramas</h2>
          <Rail title="Most Watched" ids={RAILS.mostWatched} />
        </>
      ) : (
        <motion.div key={chip} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Rail title={`Top in ${chip}`} ids={genreIds} action={`${genreIds.length} shows`} />
          <Rail title="New this week" ids={[...genreIds].reverse()} />
        </motion.div>
      )}
      <div className="tabbar-spacer" />
    </div>
  )
}

function Hero() {
  const featured = RAILS.featured.map(seriesById) as Series[]
  const [i, setI] = useState(0)
  const nav = useNavigate()
  const history = useStore((s) => s.history)
  const saved = useStore((s) => s.saved)
  const s = featured[i]
  const resume = history.find((h) => h.seriesId === s.id)

  useEffect(() => {
    const t = setTimeout(() => setI((x) => (x + 1) % featured.length), 6000)
    return () => clearTimeout(t)
  }, [i, featured.length])

  return (
    <section className="hero">
      <AnimatePresence initial={false}>
        <motion.img
          key={s.id}
          src={s.poster}
          className="hero-img"
          alt=""
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          onClick={() => nav(`/series/${s.id}`)}
        />
      </AnimatePresence>
      <div className="hero-shade" />
      <div className="hero-content">
        <div className="hero-tags">
          <span className="spotlight">Spotlight</span>
          {s.genres.slice(0, 3).map((g) => (
            <span key={g} className="dot-sep">{g}</span>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <h1 className="hero-title" onClick={() => nav(`/series/${s.id}`)}>{s.title}</h1>
            <p className="hero-tagline">{s.tagline}</p>
            <div className="hero-stats">
              <span className="row gap-4"><Icon name="star" size={17} /> {s.rating}</span>
              <span className="sep-dot" />
              <span>{s.episodeCount} Episodes</span>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="row gap-12">
          <button className="btn btn-primary btn-lg grow" onClick={() => nav(`/watch/${s.id}/${resume?.ep ?? 1}`)}>
            <Icon name="play" size={20} />
            {resume ? `Continue Ep ${resume.ep}` : 'Watch now'}
          </button>
          <button
            className={'btn-circle' + (saved.includes(s.id) ? ' on' : '')}
            aria-label="Add to library"
            onClick={() => {
              useStore.getState().toggleSaved(s.id)
              useStore.getState().showToast(saved.includes(s.id) ? 'Removed from library' : 'Saved to library')
            }}
          >
            <Icon name={saved.includes(s.id) ? 'check' : 'plus'} size={22} />
          </button>
        </div>
        <div className="hero-dots">
          {featured.map((f, k) => (
            <button key={f.id} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Show ${f.title}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ContinueWatching() {
  const history = useStore((s) => s.history)
  return (
    <section className="rail">
      <div className="section-header">
        <h3>Continue Watching</h3>
      </div>
      <div className="rail-scroll">
        {history.slice(0, 6).map((h) => {
          const s = seriesById(h.seriesId)
          if (!s) return null
          const ep = getEpisode(s, h.ep)
          return (
            <Link key={h.seriesId} to={`/watch/${s.id}/${h.ep}`} className="continue-card">
              <div className="continue-img">
                <img src={ep.still} alt="" />
                <span className="continue-play"><Icon name="playFill" size={16} /></span>
                <div className="continue-bar"><i style={{ width: `${Math.min(100, (h.ep / s.episodeCount) * 100 + 4)}%` }} /></div>
              </div>
              <div className="continue-title">{s.title}</div>
              <div className="continue-sub">Ep {h.ep} · {ep.title}</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
