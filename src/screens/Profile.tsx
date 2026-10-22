import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { img } from '../data/catalog'
import { ADS_PER_DAY, DAILY_BONUS, useStore } from '../store'

export function Profile() {
  const nav = useNavigate()
  const { coins, vip, history, seasons, unlocked } = useStore()
  const adsLeft = useStore((s) => s.adsLeft())
  const { resetDemo } = useStore.getState()
  const unlockedCount = Object.values(unlocked).reduce((n, eps) => n + eps.length, 0)

  return (
    <div className="scroll profile">
      <div className="profile-top">
        <img src={img('a-user')} alt="" />
        <h1>Sarah Connor</h1>
        <small>{vip ? `VIP · ${vip.plan === 'year' ? 'Yearly' : 'Weekly'} plan` : 'Free plan'}</small>
      </div>

      <div className="pad-x">
        <div className="wallet">
          <div>
            <small>Coin balance</small>
            <b className="row gap-6"><Icon name="zap" size={22} stroke={2.4} className="cyan" /> {coins.toLocaleString('en')}</b>
            <small>+{DAILY_BONUS} every day you open the app</small>
          </div>
          <button className="btn btn-primary" onClick={() => nav('/store')}>Top up</button>
        </div>

        {!vip && (
          <button className="vip-card" onClick={() => nav('/vip')}>
            <span className="vip-icon"><Icon name="crown" size={22} /></span>
            <span className="grow">
              <b>Try VIP</b>
              <small>Unlock every episode · No ads</small>
            </span>
            <Icon name="chevron" size={18} />
          </button>
        )}

        <div className="stats">
          <div><b>{history.length}</b><small>Shows started</small></div>
          <div><b>{unlockedCount + seasons.length}</b><small>Unlocks</small></div>
          <div><b>{adsLeft}/{ADS_PER_DAY}</b><small>Free ad unlocks</small></div>
        </div>

        <h4 className="caps-title">Prototype tools</h4>
        <div className="settings-list">
          <button onClick={() => { resetDemo(); nav('/home') }}>
            <span className="settings-icon"><Icon name="refresh" size={18} /></span>
            <span className="grow">Reset demo state</span>
            <Icon name="chevron" size={18} />
          </button>
          <button onClick={() => { useStore.setState({ authed: false }); nav('/') }}>
            <span className="settings-icon"><Icon name="user" size={18} /></span>
            <span className="grow">Sign out (show onboarding)</span>
            <Icon name="chevron" size={18} />
          </button>
        </div>
      </div>
      <div className="tabbar-spacer" />
    </div>
  )
}
