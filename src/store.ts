import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { FREE_EPISODES, PRICES, seriesById } from './data/catalog'

export type UnlockMethod = 'coins' | 'season-coins' | 'season-paid' | 'vip' | 'ad'

export interface AnalyticsEvent {
  id: number
  name: string
  props?: Record<string, string | number | boolean>
  at: number
}

export interface Toast {
  id: number
  text: string
  kind?: 'success' | 'info'
}

const START_COINS = 60
export const DAILY_BONUS = 30
export const ADS_PER_DAY = 3

const today = () => new Date().toISOString().slice(0, 10)

interface PersistedState {
  authed: boolean
  coins: number
  vip: { plan: string; since: number } | null
  unlocked: Record<string, number[]>
  seasons: string[]
  saved: string[]
  liked: string[]
  history: { seriesId: string; ep: number; at: number }[]
  ads: { day: string; count: number }
  lastBonusDay: string | null
}

interface State extends PersistedState {
  unlockFor: { seriesId: string; ep: number } | null
  toast: Toast | null
  events: AnalyticsEvent[]

  signIn: (provider: string) => void
  isUnlocked: (seriesId: string, ep: number) => boolean
  adsLeft: () => number

  openUnlock: (seriesId: string, ep: number, source: string) => void
  closeUnlock: (reason?: string) => void

  unlockWithCoins: (seriesId: string, ep: number) => boolean
  unlockSeasonWithCoins: (seriesId: string) => boolean
  unlockSeasonPaid: (seriesId: string) => void
  unlockWithAd: (seriesId: string, ep: number) => void
  claimDailyBonus: () => boolean
  subscribe: (plan: string, price: number) => void

  toggleSaved: (seriesId: string) => void
  toggleLiked: (key: string) => void
  setWatched: (seriesId: string, ep: number) => void

  track: (name: string, props?: AnalyticsEvent['props']) => void
  showToast: (text: string, kind?: Toast['kind']) => void
  resetDemo: () => void
}

const initial: PersistedState = {
  authed: false,
  coins: START_COINS,
  vip: null,
  unlocked: {},
  seasons: [],
  saved: ['the-ceo-and-i', 'forbidden-secrets', 'second-chance-love', 'royal-contract'],
  liked: [],
  history: [],
  ads: { day: today(), count: 0 },
  lastBonusDay: null,
}

let seq = 1

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      unlockFor: null,
      toast: null,
      events: [],

      signIn: (provider) => {
        set({ authed: true })
        get().track('sign_in', { provider })
      },

      isUnlocked: (seriesId, ep) => {
        const s = get()
        return ep <= FREE_EPISODES || !!s.vip || s.seasons.includes(seriesId) || !!s.unlocked[seriesId]?.includes(ep)
      },

      adsLeft: () => {
        const { ads } = get()
        return ads.day === today() ? Math.max(0, ADS_PER_DAY - ads.count) : ADS_PER_DAY
      },

      openUnlock: (seriesId, ep, source) => {
        set({ unlockFor: { seriesId, ep } })
        get().track('paywall_view', { series: seriesId, ep, source, balance: get().coins })
      },
      closeUnlock: (reason = 'dismiss') => {
        const u = get().unlockFor
        if (u && reason === 'dismiss') get().track('paywall_dismiss', { series: u.seriesId, ep: u.ep })
        set({ unlockFor: null })
      },

      unlockWithCoins: (seriesId, ep) => {
        const { coins, unlocked } = get()
        if (coins < PRICES.episodeCoins) return false
        set({
          coins: coins - PRICES.episodeCoins,
          unlocked: { ...unlocked, [seriesId]: [...(unlocked[seriesId] ?? []), ep] },
          unlockFor: null,
        })
        get().track('unlock_success', { method: 'coins', series: seriesId, ep, cost: PRICES.episodeCoins })
        return true
      },

      unlockSeasonWithCoins: (seriesId) => {
        const { coins, seasons } = get()
        if (coins < PRICES.seasonCoins) return false
        set({ coins: coins - PRICES.seasonCoins, seasons: [...seasons, seriesId], unlockFor: null })
        get().track('unlock_success', { method: 'season-coins', series: seriesId, cost: PRICES.seasonCoins })
        return true
      },

      unlockSeasonPaid: (seriesId) => {
        set((s) => ({ seasons: [...s.seasons, seriesId], unlockFor: null }))
        get().track('purchase', { sku: `season_${seriesId}`, price: PRICES.seasonEuro })
        get().track('unlock_success', { method: 'season-paid', series: seriesId })
      },

      unlockWithAd: (seriesId, ep) => {
        set((s) => ({
          unlocked: { ...s.unlocked, [seriesId]: [...(s.unlocked[seriesId] ?? []), ep] },
          ads: { day: today(), count: (s.ads.day === today() ? s.ads.count : 0) + 1 },
          unlockFor: null,
        }))
        get().track('unlock_success', { method: 'ad', series: seriesId, ep })
      },

      claimDailyBonus: () => {
        if (get().lastBonusDay === today()) return false
        set((s) => ({ coins: s.coins + DAILY_BONUS, lastBonusDay: today() }))
        get().track('daily_bonus', { coins: DAILY_BONUS })
        return true
      },

      subscribe: (plan, price) => {
        set({ vip: { plan, since: Date.now() }, unlockFor: null })
        get().track('subscribe', { plan, price })
      },

      toggleSaved: (seriesId) => {
        const saved = get().saved
        const on = !saved.includes(seriesId)
        set({ saved: on ? [seriesId, ...saved] : saved.filter((id) => id !== seriesId) })
        get().track(on ? 'save' : 'unsave', { series: seriesId })
      },

      toggleLiked: (key) =>
        set((s) => ({ liked: s.liked.includes(key) ? s.liked.filter((k) => k !== key) : [...s.liked, key] })),

      setWatched: (seriesId, ep) =>
        set((s) => ({
          history: [{ seriesId, ep, at: Date.now() }, ...s.history.filter((h) => h.seriesId !== seriesId)].slice(0, 12),
        })),

      track: (name, props) => {
        const ev = { id: seq++, name, props, at: Date.now() }
        console.info('[analytics]', name, props ?? {})
        set((s) => ({ events: [ev, ...s.events].slice(0, 40) }))
      },

      showToast: (text, kind = 'success') => set({ toast: { id: seq++, text, kind } }),

      resetDemo: () => {
        set({ ...initial, ads: { day: today(), count: 0 }, lastBonusDay: today(), unlockFor: null, events: [] })
        get().showToast('Demo reset', 'info')
      },
    }),
    {
      name: 'dramaflash-demo',
      storage: createJSONStorage(() => {
        try {
          return localStorage
        } catch {
          const mem = new Map<string, string>()
          return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) }
        }
      }),
      partialize: (s): PersistedState => ({
        authed: s.authed,
        coins: s.coins,
        vip: s.vip,
        unlocked: s.unlocked,
        seasons: s.seasons,
        saved: s.saved,
        liked: s.liked,
        history: s.history,
        ads: s.ads,
        lastBonusDay: s.lastBonusDay,
      }),
    },
  ),
)

export const useIsUnlocked = (seriesId: string, ep: number) =>
  useStore((s) => ep <= FREE_EPISODES || !!s.vip || s.seasons.includes(seriesId) || !!s.unlocked[seriesId]?.includes(ep))

export const seriesTitle = (id: string) => seriesById(id)?.title ?? id
