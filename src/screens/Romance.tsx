import { motion } from 'framer-motion'
import { useState } from 'react'
import { PosterCard } from '../components/ui'
import { SERIES } from '../data/catalog'

const MOODS = ['All', 'Billionaire', 'Forbidden Love', 'Second Chance', 'Enemies to Lovers', 'Revenge']

export function Romance() {
  const [mood, setMood] = useState('All')
  const list = SERIES.filter((s) => s.genres.includes('Romance') || s.genres.includes('Drama')).filter(
    (s) => mood === 'All' || s.tags.some((t) => t.includes(mood)) || s.genres.some((g) => g === mood),
  )
  return (
    <div className="scroll romance">
      <header className="page-header">
        <h1 className="genre-title flush grad-text">Romance</h1>
      </header>
      <div className="chips">
        {MOODS.map((m) => (
          <button key={m} className={'chip' + (m === mood ? ' active' : '')} onClick={() => setMood(m)}>
            {m}
          </button>
        ))}
      </div>
      <motion.div key={mood} className="poster-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {list.map((s) => (
          <PosterCard key={s.id} series={s} size="fill" />
        ))}
      </motion.div>
      <div className="tabbar-spacer" />
    </div>
  )
}
