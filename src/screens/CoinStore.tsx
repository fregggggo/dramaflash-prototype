import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { BackButton } from '../components/ui'
import { COIN_PACKS, fmtEuro, getEpisode, PRICES, seriesById, VIP_PLANS } from '../data/catalog'
import { DAILY_BONUS, useStore } from '../store'

export function CoinStore() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const need = Number(params.get('need') ?? 0)
  const coins = useStore((s) => s.coins)
  const unlockFor = useStore((s) => s.unlockFor)
  const { showToast, track } = useStore.getState()

  const fit = COIN_PACKS.find((p) => p.coins + p.bonus >= Math.max(need, 850)) ?? COIN_PACKS[1]
  const [packId, setPackId] = useState<string>(fit.id)
  const pack = COIN_PACKS.find((p) => p.id === packId)!

  const series = unlockFor ? seriesById(unlockFor.seriesId) : undefined
  const ep = series && unlockFor ? getEpisode(series, unlockFor.ep) : undefined

  return (
    <div className="scroll store">
      <header className="page-header">
        <BackButton />
        <h1>{unlockFor ? 'Unlock Episode' : 'Coin Store'}</h1>
      </header>

      <div className="store-body">
        {series && ep && unlockFor && (
          <div className="store-episode">
            <div className="store-episode-img">
              <img src={series.poster} alt="" />
              <span><Icon name="lock" size={12} /></span>
            </div>
            <div>
              <b>{series.title}</b>
              <small>Episode {unlockFor.ep} • Locked</small>
              <span className="pill-cyan"><Icon name="lock" size={14} /> Unlock for {PRICES.episodeCoins} Coins</span>
            </div>
          </div>
        )}

        <div className="balance-card">
          <div>
            <span>Your Balance</span>
            <small className="balance-note">+{DAILY_BONUS} coins every day you open the app</small>
          </div>
          <b className="row gap-6">
            <Icon name="zap" size={18} stroke={2.4} className="cyan" />
            <motion.span key={coins} initial={{ scale: 1.4, color: '#64EDF7' }} animate={{ scale: 1, color: '#fff' }}>
              {coins.toLocaleString('en')}
            </motion.span>
            <span>Coins</span>
          </b>
        </div>

        <div className="divider" />
        <h2 className="block-title">Recharge Coins</h2>
        <div className="pack-grid">
          {COIN_PACKS.map((p) => (
            <button key={p.id} className={'pack' + (p.id === packId ? ' selected' : '') + ('badge' in p ? ' has-badge' : '')} onClick={() => setPackId(p.id)}>
              {'badge' in p && <span className={'pack-badge' + (p.badge === 'Best value' ? ' purple' : '')}>{p.badge}</span>}
              {p.id === packId && <span className="pack-check"><Icon name="checkCircle" size={18} /></span>}
              <Icon name="zap" size={30} stroke={1.8} className="cyan" />
              <b className="pack-coins">{p.coins.toLocaleString('en')}</b>
              <small className="pack-bonus">{p.bonus ? `+ ${p.bonus} Bonus` : ' '}</small>
              <span className="pack-price">{fmtEuro(p.price)}</span>
            </button>
          ))}
        </div>

        <div className="or-divider"><span>or go unlimited</span></div>

        <button className="vip-card" onClick={() => nav('/vip')}>
          <span className="vip-icon"><Icon name="crown" size={22} /></span>
          <span className="grow">
            <b>VIP Membership</b>
            <small>Free episodes • No ads</small>
          </span>
          <span className="vip-price">
            <b>€{VIP_PLANS[0].price}</b>
            <small>/ Week</small>
          </span>
        </button>
        <div className="store-spacer" />
      </div>

      <div className="store-footer">
        <div className="trust-row">
          <span><Icon name="shield" size={16} /> Secure</span>
          <span><Icon name="card" size={16} /> App Store billing</span>
        </div>
        <button
          className="btn-gradient-border"
          onClick={() => {
            track('coin_pack_cta', { sku: pack.id, blocked: true })
            showToast('Coin purchases are not available in the beta', 'info')
          }}
        >
          <b className="grad-text">Buy {(pack.coins + pack.bonus).toLocaleString('en')} Coins</b>
          <small>for {fmtEuro(pack.price)}</small>
        </button>
        <p className="fine-print center">By purchasing, you agree to our Terms of Service. Subscriptions auto-renew unless canceled.</p>
      </div>
    </div>
  )
}
