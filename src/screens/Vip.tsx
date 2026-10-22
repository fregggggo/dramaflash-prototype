import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { BackButton, PaySheet } from '../components/ui'
import { fmtEuro, img, VIP_PLANS } from '../data/catalog'
import { useStore } from '../store'

const PERKS: [IconName, string, string][] = [
  ['unlock', 'Every episode unlocked', 'No coins, no waiting — binge entire seasons'],
  ['tv', 'No ads', 'Zero interruptions, ever'],
  ['sparkles', 'New episodes first', 'Watch premieres 24h before everyone else'],
  ['gift', '100 bonus coins / week', 'Use them for exclusive extras'],
]

const COLLAGE = ['p-dark-desire', 'p-shadow-kiss', 'p-royal-contract', 'p-avenging-angel', 'p-forbidden-love', 'p-heirs-dilemma']

export function Vip() {
  const nav = useNavigate()
  const vip = useStore((s) => s.vip)
  const unlockFor = useStore((s) => s.unlockFor)
  const [planId, setPlanId] = useState<string>('year')
  const [payOpen, setPayOpen] = useState(false)
  const plan = VIP_PLANS.find((p) => p.id === planId)!
  const { subscribe, showToast, track } = useStore.getState()

  return (
    <div className="scroll vip">
      <div className="vip-collage">
        {COLLAGE.map((c, i) => (
          <motion.img
            key={c}
            src={img(c)}
            alt=""
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: i % 2 ? 24 : 0 }}
            transition={{ delay: i * 0.06 }}
          />
        ))}
        <div className="vip-collage-shade" />
        <div className="vip-close">
          <BackButton />
        </div>
      </div>

      <div className="vip-body">
        <div className="vip-crown"><Icon name="crown" size={28} /></div>
        <h1 className="vip-title">
          DramaFlash <span className="grad-text">VIP</span>
        </h1>
        <p className="vip-sub">{unlockFor ? 'Unlock this episode — and every other one.' : 'All the drama. None of the waiting.'}</p>

        <div className="perks">
          {PERKS.map(([icon, t, s]) => (
            <div key={t} className="perk">
              <span><Icon name={icon} size={18} /></span>
              <div>
                <b>{t}</b>
                <small>{s}</small>
              </div>
            </div>
          ))}
        </div>

        {vip ? (
          <div className="vip-active">
            <Icon name="checkCircle" size={22} /> You're VIP — enjoy unlimited drama.
          </div>
        ) : (
          <>
            <div className="plans">
              {VIP_PLANS.map((p) => (
                <button key={p.id} className={'plan' + (p.id === planId ? ' selected' : '')} onClick={() => setPlanId(p.id)}>
                  {'badge' in p && <span className="option-badge">{p.badge}</span>}
                  <span className="radio">{p.id === planId && <Icon name="check" size={13} stroke={3} />}</span>
                  <span className="grow">
                    <b>{p.label}</b>
                    <small>{p.note}</small>
                  </span>
                  <span className="plan-price">
                    <b>{fmtEuro(p.price)}</b>
                    <small>{p.per}</small>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {!vip && (
        <div className="vip-footer">
          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={() => {
              track('vip_cta', { plan: plan.id })
              setPayOpen(true)
            }}
          >
            <Icon name="crown" size={20} /> Start VIP · {fmtEuro(plan.price)} {plan.per}
          </button>
          <p className="fine-print center">Auto-renews. Cancel anytime in your store settings.</p>
        </div>
      )}

      <PaySheet
        open={payOpen}
        title={`DramaFlash VIP — ${plan.label}`}
        subtitle="Auto-renewing subscription"
        price={`${fmtEuro(plan.price)} ${plan.per}`}
        onClose={() => setPayOpen(false)}
        onConfirm={() => {
          setPayOpen(false)
          subscribe(plan.id, plan.price)
          showToast('Welcome to VIP!')
          setTimeout(() => (unlockFor ? nav(-1) : nav('/home')), 500)
        }}
      />
    </div>
  )
}
