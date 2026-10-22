import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppleLogo, GoogleG, Icon, Logo } from '../components/Icon'
import { useStore } from '../store'

export function Login() {
  const nav = useNavigate()
  const signIn = useStore((s) => s.signIn)
  const go = (provider: string) => {
    signIn(provider)
    nav('/home', { replace: true })
  }

  return (
    <div className="login">
      <div className="login-brand">
        <Logo size={34} />
        <span>DramaFlash</span>
      </div>

      <motion.div className="login-copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h1>
          <span className="cyan">Your next</span> obsession <span className="purple">starts here.</span>
        </h1>
        <p>Dive into premium short-form romances.</p>
      </motion.div>

      <motion.div className="login-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button className="btn-outline" onClick={() => go('google')}>
          <GoogleG /> <span>Continue with Google</span>
        </button>
        <button className="btn-outline" onClick={() => go('apple')}>
          <AppleLogo /> <span>Continue with Apple</span>
        </button>
        <div className="or-divider"><span>or</span></div>
        <button className="btn btn-primary btn-block btn-lg" onClick={() => go('email')}>
          <Icon name="mail" size={20} /> Continue with Email
        </button>
        <div className="login-foot">
          <p>
            New here? <button className="link" onClick={() => go('signup')}>Create account <Icon name="chevron" size={14} /></button>
          </p>
          <div className="row gap-16 muted-links">
            <span>Terms</span>
            <span className="sep-dot" />
            <span>Privacy</span>
          </div>
        </div>
      </motion.div>

      <div className="secure-pill">
        <Icon name="shield" size={15} /> 100% Secure &amp; Encrypted
      </div>
      <p className="fine-print center demo-note">Prototype — any option signs you in instantly.</p>
    </div>
  )
}
