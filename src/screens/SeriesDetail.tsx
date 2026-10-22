import { motion } from 'framer-motion'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { BackButton, PaySheet, Rail } from '../components/ui'
import { fmtEuro, fmtTime, getEpisodes, PRICES, RAILS, seriesById, type Episode, type Series } from '../data/catalog'
import { useIsUnlocked, useStore } from '../store'

export function SeriesDetail() {
  const { seriesId = '' } = useParams()
  const series = seriesById(seriesId)
  if (!series) return <Navigate to="/home" replace />
  return <SeriesView key={series.id} series={series} />
}

function SeriesView({ series }: { series: Series }) {
  const nav = useNavigate()
  const [shown, setShown] = useState(6)
  const [payOpen, setPayOpen] = useState(false)
  const saved = useStore((s) => s.saved.includes(series.id))
  const resume = useStore((s) => s.history.find((h) => h.seriesId === series.id))
  const allAccess = useStore((s) => !!s.vip || s.seasons.includes(series.id))
  const { toggleSaved, showToast, unlockSeasonPaid, track } = useStore.getState()
  const episodes = getEpisodes(series, shown)

  return (
    <div className="scroll series">
      <div className="series-topbar">
        <BackButton />
        <button className="icon-btn glass" aria-label="Share" onClick={() => showToast('Link copied', 'info')}>
          <Icon name="upload" size={20} />
        </button>
      </div>
      <div className="series-hero">
        <img src={series.poster} alt="" />
        <div className="series-hero-shade" />
      </div>

      <div className="series-body">
        <div className="tag-row">
          {series.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <h1 className="series-title">{series.title}</h1>
        <div className="series-stats">
          <span className="row gap-4"><Icon name="star" size={17} /> {series.rating} <small>({series.ratingCount})</small></span>
          <span className="sep-dot" />
          <span>{series.year}</span>
          <span className="sep-dot" />
          <span className="row gap-4"><Icon name="list" size={17} /> {series.episodeCount} Eps</span>
        </div>

        <div className="row gap-12">
          <button className="btn btn-primary btn-lg grow" onClick={() => nav(`/watch/${series.id}/${resume?.ep ?? 1}`)}>
            <Icon name="play" size={20} /> {resume ? `Continue Ep ${resume.ep}` : 'Play Ep 1'}
          </button>
          <button
            className={'btn-circle' + (saved ? ' on' : '')}
            aria-label="Save"
            onClick={() => {
              toggleSaved(series.id)
              showToast(saved ? 'Removed from library' : 'Saved to library')
            }}
          >
            <Icon name={saved ? 'heartFill' : 'heart'} size={20} />
          </button>
        </div>

        <h3 className="block-title">Synopsis</h3>
        <p className="synopsis">{series.synopsis}</p>

        {series.whyLove && (
          <div className="why-card">
            <div className="why-head"><Icon name="sparkles" size={18} /> Why you'll love it</div>
            {series.whyLove.map((w) => (
              <div key={w} className="why-row"><Icon name="flame" size={16} /> {w}</div>
            ))}
          </div>
        )}
      </div>

      {series.cast && (
        <section className="cast">
          <h3 className="block-title pad">Cast &amp; Crew</h3>
          <div className="cast-row">
            {series.cast.map((c) => (
              <div key={c.name} className="cast-item">
                <img src={c.img} alt="" />
                <b>{c.name}</b>
                <small>{c.role}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="episodes">
        <div className="section-header">
          <h3 className="row gap-8">Episodes <span className="count-pill">{series.episodeCount}</span></h3>
        </div>

        {!allAccess && (
          <button
            className="season-banner"
            onClick={() => {
              track('season_bundle_tap', { series: series.id })
              setPayOpen(true)
            }}
          >
            <div>
              <b>Unlock Full Season</b>
              <small>Save 40% with the bundle</small>
            </div>
            <span className="season-price">{fmtEuro(PRICES.seasonEuro)}</span>
          </button>
        )}

        <div className="ep-list">
          {episodes.map((e) => (
            <EpisodeRow key={e.n} series={series} ep={e} current={resume?.ep === e.n} />
          ))}
        </div>
        {shown < series.episodeCount && (
          <button className="show-more" onClick={() => setShown((s) => s + 12)}>
            Show more episodes <Icon name="chevron" size={16} />
          </button>
        )}
      </section>

      <Rail title="You might also like" ids={RAILS.similar.filter((id) => id !== series.id)} action="" />
      <div className="tabbar-spacer" />

      <PaySheet
        open={payOpen}
        title={`${series.title} — Full Season`}
        subtitle={`All ${series.episodeCount} episodes, forever`}
        price={fmtEuro(PRICES.seasonEuro)}
        onClose={() => setPayOpen(false)}
        onConfirm={() => {
          setPayOpen(false)
          unlockSeasonPaid(series.id)
          showToast('Full season unlocked')
        }}
      />
    </div>
  )
}

function EpisodeRow({ series, ep, current }: { series: Series; ep: Episode; current: boolean }) {
  const nav = useNavigate()
  const unlocked = useIsUnlocked(series.id, ep.n)
  const open = () => (unlocked ? nav(`/watch/${series.id}/${ep.n}`) : useStore.getState().openUnlock(series.id, ep.n, 'series'))
  return (
    <motion.button className="ep-row" onClick={open} whileTap={{ scale: 0.98 }}>
      <div className="ep-thumb">
        <img src={ep.still} alt="" loading="lazy" />
        <span className={'ep-thumb-icon' + (unlocked ? '' : ' locked')}>
          <Icon name={unlocked ? 'playFill' : 'lock'} size={unlocked ? 14 : 16} />
        </span>
      </div>
      <div className="ep-info">
        <b>{ep.n}. {ep.title}</b>
        <span className="row gap-6">
          <Icon name="clock" size={14} /> {fmtTime(ep.duration)}
          {current && <span className="now-tag">Watching</span>}
          {!unlocked && (
            <span className="unlock-link">
              Unlock <Icon name="unlock" size={13} />
            </span>
          )}
        </span>
      </div>
    </motion.button>
  )
}
