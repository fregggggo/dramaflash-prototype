import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getEpisode, PRICES, seriesById, VIP_PLANS } from '../data/catalog'
import { DAILY_BONUS, useStore } from '../store'
import { AdBreak } from './AdBreak'
import { Icon } from './Icon'
import { Sheet } from './ui'

type Option = 'episode' | 'season' | 'vip' | 'ad'

const HANDOFF_ROUTES = ['/store', '/vip']

export function UnlockSheet() {
  const unlockFor = useStore((s) => s.unlockFor)
  const coins = useStore((s) => s.coins)
  const adsLeft = useStore((s) => s.adsLeft())
  const { closeUnlock, unlockWithCoins, unlockSeasonWithCoins, unlockWithAd, showToast, track } = useStore.getState()
  const nav = useNavigate()
  const { pathname } = useLocation()

  const [option, setOption] = useState<Option>('episode')
  const [adOpen, setAdOpen] = useState(false)
  const origin = useRef<string | null>(null)

  useEffect(() => {
    if (!unlockFor) {
      origin.current = null
      return
    }
    if (origin.current === null) {
      origin.current = pathname
      const { coins, adsLeft } = useStore.getState()
      setOption(coins >= PRICES.episodeCoins ? 'episode' : adsLeft() > 0 ? 'ad' : 'vip')
    } else if (pathname !== origin.current && !HANDOFF_ROUTES.includes(pathname)) {
      closeUnlock('navigate')
    }
  }, [unlockFor, pathname, closeUnlock])

  const series = unlockFor ? seriesById(unlockFor.seriesId) : undefined
  const ep = series && unlockFor ? getEpisode(series, unlockFor.ep) : undefined
  const open = !!unlockFor && !!series && !HANDOFF_ROUTES.includes(pathname) && !adOpen

  const cost = option === 'season' ? PRICES.seasonCoins : PRICES.episodeCoins
  const missing = option === 'episode' || option === 'season' ? Math.max(0, cost - coins) : 0
  const weekly = VIP_PLANS[0]

  const goWatch = (sid: string, n: number) => {
    const target = `/watch/${sid}/${n}`
    if (pathname !== target) nav(target, { replace: pathname.startsWith('/watch/') })
  }

  const confirm = () => {
    if (!series || !unlockFor) return
    track('paywall_cta', { option, series: series.id, ep: unlockFor.ep, missing })
    if (option === 'vip') return nav('/vip')
    if (option === 'ad') return setAdOpen(true)
    if (missing > 0) return
    const ok = option === 'season' ? unlockSeasonWithCoins(series.id) : unlockWithCoins(series.id, unlockFor.ep)
    if (ok) {
      showToast(option === 'season' ? 'Full season unlocked' : `Episode ${unlockFor.ep} unlocked`)
      goWatch(series.id, unlockFor.ep)
    }
  }

  const ctaLabel =
    option === 'vip'
      ? 'Go Premium'
      : option === 'ad'
        ? 'Watch ad & unlock'
        : missing > 0
          ? 'Not enough coins'
          : 'Unlock Now'

  return (
    <>
      <Sheet open={open} onClose={() => closeUnlock()} className="unlock-sheet">
        {series && ep && unlockFor && (
          <>
            <div className="unlock-thumb">
              <img src={ep.frame} alt="" />
              <div className="unlock-thumb-lock">
                <span><Icon name="lock" size={18} /></span>
                Locked
              </div>
            </div>
            <div className="eyebrow center">Episode {unlockFor.ep}</div>
            <h2 className="unlock-title">Continue the romance</h2>
            <p className="unlock-sub">Find out what happens after that cliffhanger — unlock and keep watching.</p>

            <div className="balance-row">
              <span>Your balance</span>
              <button className="balance-val" onClick={() => nav('/store')}>
                <Icon name="zap" size={15} stroke={2.4} /> {coins} coins <span className="link">Top up</span>
              </button>
            </div>

            <div className="unlock-options" role="radiogroup">
              <OptionRow
                selected={option === 'episode'}
                onSelect={() => setOption('episode')}
                title="Unlock Episode"
                sub={coins >= PRICES.episodeCoins ? 'One-time access' : `You need ${PRICES.episodeCoins - coins} more coins`}
                value={`${PRICES.episodeCoins} Coins`}
                disabled={coins < PRICES.episodeCoins}
              />
              <OptionRow
                selected={option === 'season'}
                onSelect={() => setOption('season')}
                title="Unlock Full Season"
                sub={coins >= PRICES.seasonCoins ? `Episodes ${unlockFor.ep} – ${series.episodeCount}` : `You need ${PRICES.seasonCoins - coins} more coins`}
                value={`${PRICES.seasonCoins} Coins`}
                badge="Best value"
                disabled={coins < PRICES.seasonCoins}
              />
              <OptionRow
                selected={option === 'vip'}
                onSelect={() => setOption('vip')}
                title="Premium Membership"
                sub="Unlimited access · No ads"
                value={`€${weekly.price}/wk`}
              />
              <OptionRow
                selected={option === 'ad'}
                onSelect={() => adsLeft > 0 && setOption('ad')}
                disabled={adsLeft === 0}
                title="Watch a short ad"
                sub={adsLeft > 0 ? `${adsLeft} of 3 free unlocks left today` : 'Daily limit reached — back tomorrow'}
                value="Free"
                icon="tv"
              />
            </div>

            <AnimatePresence initial={false}>
              {missing > 0 && (
                <motion.p className="unlock-hint" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  Not enough coins — you get {DAILY_BONUS} more tomorrow. Watch an ad or go Premium to continue now.
                </motion.p>
              )}
            </AnimatePresence>

            <button className="btn btn-primary btn-block btn-lg" onClick={confirm} disabled={missing > 0}>
              <Icon name={option === 'ad' ? 'tv' : option === 'vip' ? 'crown' : missing > 0 ? 'zap' : 'lock'} size={20} />
              {ctaLabel}
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => closeUnlock()}>
              Maybe Later
            </button>
          </>
        )}
      </Sheet>

      <AnimatePresence>
        {adOpen && series && unlockFor && (
          <AdBreak
            onClose={() => {
              setAdOpen(false)
              track('ad_abandon', { series: series.id, ep: unlockFor.ep })
            }}
            onReward={() => {
              setAdOpen(false)
              unlockWithAd(series.id, unlockFor.ep)
              showToast(`Episode ${unlockFor.ep} unlocked — enjoy!`)
              goWatch(series.id, unlockFor.ep)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function OptionRow({
  selected,
  onSelect,
  title,
  sub,
  value,
  badge,
  disabled,
  icon,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  sub: string
  value: string
  badge?: string
  disabled?: boolean
  icon?: 'tv'
}) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      className={'option-row' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '')}
      onClick={disabled ? undefined : onSelect}
    >
      {badge && <span className="option-badge">{badge}</span>}
      <span className="radio">{selected && <Icon name="check" size={13} stroke={3} />}</span>
      <span className="option-text">
        <span className="option-title">
          {icon && <Icon name={icon} size={15} />} {title}
        </span>
        <span className="option-sub">{sub}</span>
      </span>
      <span className="option-value">{value}</span>
    </button>
  )
}
