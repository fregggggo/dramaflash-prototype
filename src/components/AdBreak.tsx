import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Icon } from './Icon'

const AD_SECONDS = 8

export function AdBreak({ onReward, onClose }: { onReward: () => void; onClose: () => void }) {
  const [left, setLeft] = useState(AD_SECONDS)
  const done = left <= 0

  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, done])

  const r = 15
  const c = 2 * Math.PI * r

  return (
    <motion.div className="ad-break" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="ad-top">
        <span className="ad-label">Sponsored</span>
        {done ? (
          <button className="icon-btn glass" onClick={onReward} aria-label="Close ad and claim reward">
            <Icon name="x" size={20} />
          </button>
        ) : (
          <div className="ad-timer">
            <svg width="38" height="38" viewBox="0 0 38 38">
              <circle cx="19" cy="19" r={r} stroke="rgba(255,255,255,.2)" strokeWidth="3" fill="none" />
              <circle
                cx="19" cy="19" r={r} stroke="var(--cyan)" strokeWidth="3" fill="none" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={c * (left / AD_SECONDS)}
                style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <span>{left}</span>
          </div>
        )}
      </div>

      <div className="ad-creative">
        <motion.div
          className="ad-bottle"
          animate={{ y: [0, -10, 0], rotate: [-4, 2, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="ad-bottle-cap" />
          <div className="ad-bottle-body">
            <span>GLOW</span>
            <small>night serum</small>
          </div>
        </motion.div>
        <div className="ad-copy">
          <div className="ad-brand">Lumière Skin · Partner</div>
          <h2>Wake up glowing.</h2>
          <p>Our bestselling night serum — now 20% off for DramaFlash viewers.</p>
          <div className="ad-code">
            Code <b>FLASH20</b>
          </div>
        </div>
      </div>

      <div className="ad-bottom">
        {done ? (
          <motion.button className="btn btn-primary btn-block btn-lg" onClick={onReward} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <Icon name="unlock" size={20} /> Reward earned — continue watching
          </motion.button>
        ) : (
          <>
            <p className="ad-reward-hint">
              <Icon name="gift" size={16} /> Episode unlocks in {left}s
            </p>
            <button className="btn btn-ghost btn-block" onClick={onClose}>
              Close ad (no reward)
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
