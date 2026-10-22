
export const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}.jpg`

export type Genre = 'Romance' | 'Drama' | 'Action' | 'Mystery' | 'Billionaire' | 'Fantasy'

export interface CastMember {
  name: string
  role: string
  img: string
}

export interface Series {
  id: string
  title: string
  tagline: string
  synopsis: string
  genres: Genre[]
  tags: string[]
  poster: string
  hero?: string
  rating: number
  ratingCount: string
  year: number
  episodeCount: number
  minPerEp: string
  pro?: boolean
  cast?: CastMember[]
  whyLove?: string[]
  script?: Partial<EpisodeScript>[]
  stills?: string[]
  frames?: string[]
}

export interface EpisodeScript {
  title: string
  lines: string[]
  cliff: string
}

export interface Episode extends EpisodeScript {
  n: number
  duration: number
  still: string
  frame: string
}

export const FREE_EPISODES = 3

export const PRICES = {
  episodeCoins: 30,
  seasonCoins: 300,
  seasonEuro: 9.99,
}

export const COIN_PACKS = [
  { id: 'c300', coins: 300, bonus: 0, price: 2.99 },
  { id: 'c800', coins: 800, bonus: 50, price: 6.99, badge: 'Popular' },
  { id: 'c2500', coins: 2500, bonus: 200, price: 19.99 },
  { id: 'c6000', coins: 6000, bonus: 1000, price: 49.99, badge: 'Best value' },
] as const

export const VIP_PLANS = [
  { id: 'week', label: 'Weekly', price: 4.99, per: '/ week', note: 'Cancel anytime' },
  { id: 'year', label: 'Yearly', price: 59.99, per: '/ year', note: '≈ €1.15 / week · Save 77%', badge: 'Best value' },
] as const

const genericTitles = [
  'The First Glance', 'A Dangerous Deal', 'Behind Closed Doors', 'The Ring', 'Old Wounds',
  'The Rival', 'Masquerade', 'A Secret Revealed', 'Stormy Night', 'The Letter',
  'Betrayal', 'Second Thoughts', 'The Proposal', 'Shadows of the Past', 'No Way Back',
]

const genericLines = [
  ['You were never supposed to see that.', 'Then explain it. Right now.', "It's not what you think.", 'It never is with you, is it?'],
  ['Sign the contract and nobody gets hurt.', 'And if I refuse?', 'Then you lose everything you love.', 'You already took that from me.'],
  ['Why are you helping me?', "Because I owe your father a debt.", 'My father is dead.', "That's what they want you to believe."],
  ['Stay away from him. He is not who you think.', 'You barely know him.', 'I know him better than anyone.', 'Because he was mine first.'],
]

const genericCliffs = [
  'Wait… that’s my mother’s ring on her finger.',
  'The DNA test is back. He’s not your brother.',
  'Turn around slowly. He’s standing right behind you.',
  'The wedding is off. I’m marrying your sister.',
  'She’s alive. And she remembers everything.',
]

export const SERIES: Series[] = [
  {
    id: 'verbotene-liebe',
    title: 'Verbotene Liebe',
    tagline: 'A CEO’s dangerous secret contract.',
    synopsis:
      'Lena signs a one-year contract to play the fiancée of Berlin’s most feared CEO. No feelings, no questions. But the closer she gets, the more she learns about the night his family lost everything — and her own part in it.',
    genres: ['Romance', 'Drama', 'Billionaire'],
    tags: ['Contract Marriage', 'Billionaire', 'Slow Burn'],
    poster: img('p-echoes'),
    hero: img('h-verbotene-liebe'),
    rating: 4.8,
    ratingCount: '31k',
    year: 2024,
    episodeCount: 72,
    minPerEp: '2m',
    pro: true,
    cast: [
      { name: 'Alex Sterling', role: 'The CEO', img: img('a-alex') },
      { name: 'Mia Winters', role: 'Assistant', img: img('a-mia') },
      { name: 'John Doe', role: 'Rival', img: img('a-john') },
    ],
    whyLove: ['A contract romance with a real secret underneath.', 'Every episode ends on a twist.'],
    stills: [img('t-garden'), img('t-library'), img('h-verbotene-liebe')],
    frames: [img('p-echoes'), img('t-garden'), img('t-library')],
    script: [
      {
        title: 'The Contract',
        lines: ['One year. You play my fiancée.', 'And what do I get?', 'Your brother’s debts disappear.', 'No feelings. No questions.'],
        cliff: 'Then why does he have a photo of me as a child?',
      },
      {
        title: 'The Ring',
        lines: ['Wear it in public. Always.', 'It’s beautiful. Whose was it?', 'Someone who isn’t coming back.', 'You say that like it’s my fault.'],
        cliff: 'The ring has an engraving. It’s my mother’s name.',
      },
      {
        title: 'The Gala',
        lines: ['Smile. They’re all watching.', 'Who is the woman in red?', 'My ex-wife. Ignore her.', 'She’s walking straight towards us.'],
        cliff: '“Does she know you killed her father?”',
      },
    ],
  },
  {
    id: 'ceos-secret-life',
    title: "The CEO's Secret Life",
    tagline: 'Power. Deception. Legacy.',
    synopsis:
      'When a struggling artist accidentally discovers that the ruthless CEO of the city’s largest conglomerate is actually her anonymous online confidant, her life is turned upside down. Can their digital romance survive the harsh reality of corporate espionage and forbidden love?',
    genres: ['Romance', 'Drama', 'Billionaire', 'Mystery'],
    tags: ['Billionaire', 'Secret Identity', 'Romance'],
    poster: img('p-ceo-secret-life'),
    rating: 4.8,
    ratingCount: '12k',
    year: 2024,
    episodeCount: 45,
    minPerEp: '3m',
    cast: [
      { name: 'Elena', role: 'Mia, artist', img: img('a-elena') },
      { name: 'Julian Vance', role: 'Alexander, CEO', img: img('a-julian') },
      { name: 'Sarah Lin', role: 'Chloe, best friend', img: img('a-sarah-lin') },
      { name: 'Marcus', role: 'Rival CEO', img: img('a-marcus') },
    ],
    whyLove: ['Intense chemistry from the very first frame.', 'A gripping double-life narrative with high stakes.'],
    frames: [img('p-ceo-secret-life'), img('p-ceo-library'), img('p-forbidden-secrets')],
    stills: [img('t-library'), img('p-ceo-library'), img('t-garden'), img('p-forbidden-secrets'), img('p-ceo-secret-life'), img('p-forbidden-love')],
    script: [
      {
        title: 'The Accidental Message',
        lines: ['“Night Owl” sent you a message.', 'Can’t sleep again? Me neither.', 'Tell me something nobody knows about you.', 'I own the building you’re staring at.'],
        cliff: 'The light on the top floor just switched on. He’s watching her.',
      },
      {
        title: 'Coffee and Contracts',
        lines: ['Your portfolio. On my desk by noon.', 'You’re… Mr. Vance?', 'Have we met before?', 'No. Never. I would remember.'],
        cliff: 'His phone buzzes. It’s her message: “Guess who I met today.”',
      },
      {
        title: 'A Glimpse Behind the Mask',
        lines: ['You missed our late-night talk.', 'Something happened at work.', 'Tell me about it.', 'My new boss. He looks at me like he knows me.'],
        cliff: '“Because I do, Mia.” — He hits send. Then freezes.',
      },
      { title: 'The Gala Encounter' },
      { title: 'Misunderstandings' },
      { title: 'Midnight Confessions' },
    ],
  },
  {
    id: 'billionaires-secret',
    title: "The Billionaire's Secret",
    tagline: 'Unmasking the truth, one episode at a time.',
    synopsis:
      'A confidential will, a missing heir and a billionaire who will do anything to keep his past buried. Grace was hired to read the will. She was never supposed to read the last page.',
    genres: ['Billionaire', 'Drama', 'Mystery'],
    tags: ['Billionaire', 'Inheritance', 'Mystery'],
    poster: img('p-billionaire-1'),
    rating: 4.7,
    ratingCount: '8.4k',
    year: 2025,
    episodeCount: 60,
    minPerEp: '2m',
    pro: true,
    stills: [img('p-billionaire-1'), img('p-billionaire-5'), img('p-billionaire-6')],
    frames: [img('p-billionaire-1'), img('p-billionaire-5'), img('p-billionaire-6')],
    script: [
      {
        title: 'Unmasking the Truth',
        lines: ['This document is confidential.', 'Then why is my name on it?', 'Because you are in the will, Grace.', 'I’ve never met your family.'],
        cliff: 'Last will, page 9: “Everything goes to my daughter — Grace.”',
      },
      {
        title: 'The Heir',
        lines: ['Who else has seen this page?', 'Only the lawyer. And now you.', 'The lawyer died last night.', 'Then we’re next.'],
        cliff: 'A car with no plates has been parked outside for an hour.',
      },
      {
        title: 'Locked Gates',
        lines: ['The mansion has been closed for 20 years.', 'Then why are the lights on?', 'Stay behind me.', 'I have a key. My mother gave it to me.'],
        cliff: 'The key fits. And the door was already unlocked.',
      },
      { title: 'The Diamond' },
      { title: 'The Key' },
      { title: 'The Locket’s Clue' },
    ],
  },
  {
    id: 'der-ceo-und-ich', title: 'Der CEO und ich', tagline: 'Ein Vertrag. Ein Kuss. Ein Skandal.',
    synopsis: 'She was hired to fix his reputation. Nobody told her he would fall for her first.',
    genres: ['Romance', 'Billionaire'], tags: ['Billionaire', 'Office Romance'], poster: img('p-der-ceo'),
    rating: 4.6, ratingCount: '9k', year: 2024, episodeCount: 50, minPerEp: '2m', pro: true,
  },
  {
    id: 'mein-geheimes-leben', title: 'Mein geheimes Leben', tagline: 'Every smile hides a lie.',
    synopsis: 'By day a florist, by night the city’s most wanted informant.',
    genres: ['Drama', 'Mystery', 'Action'], tags: ['Double Life', 'Thriller'], poster: img('p-geheimes-leben'),
    rating: 4.5, ratingCount: '5k', year: 2025, episodeCount: 30, minPerEp: '1m',
  },
  {
    id: 'liebe-auf-umwegen', title: 'Liebe auf Umwegen', tagline: 'Paris, a wrong train and the right person.',
    synopsis: 'Two strangers swap phones by accident at Gare du Nord.',
    genres: ['Romance'], tags: ['Rom-Com', 'Travel'], poster: img('p-umwegen'),
    rating: 4.4, ratingCount: '3k', year: 2025, episodeCount: 65, minPerEp: '2m', pro: true,
  },
  {
    id: 'blutige-rosen', title: 'Blutige Rosen', tagline: 'Every rose has its thorn.',
    synopsis: 'A florist receives a single red rose every night — always from a man who died a year ago.',
    genres: ['Romance', 'Mystery'], tags: ['Forbidden Love'], poster: img('p-blutige-rosen'),
    rating: 4.6, ratingCount: '6k', year: 2024, episodeCount: 80, minPerEp: '2m', pro: true,
  },
  {
    id: 'schattenkuss', title: 'Schattenkuss', tagline: 'A forbidden love that defies the darkness.',
    synopsis: 'The heir of a vampire house falls for the hunter sent to end his bloodline.',
    genres: ['Romance', 'Fantasy'], tags: ['Forbidden Love', 'Fantasy'], poster: img('p-shadow-kiss'),
    rating: 4.7, ratingCount: '11k', year: 2024, episodeCount: 45, minPerEp: '1.5m',
  },
  {
    id: 'dunkle-begierde', title: 'Dunkle Begierde', tagline: 'A thriller of consuming passion.',
    synopsis: 'Obsession, revenge and a love that burns everything in its way.',
    genres: ['Romance', 'Drama'], tags: ['Forbidden Love', 'Revenge'], poster: img('p-dark-desire'),
    rating: 4.5, ratingCount: '7k', year: 2025, episodeCount: 60, minPerEp: '2m', pro: true,
  },
  {
    id: 'racheengel', title: 'Racheengel', tagline: 'She came back for revenge.',
    synopsis: 'Betrayed on her wedding day, she returns with a new face and a perfect plan.',
    genres: ['Action', 'Drama'], tags: ['Revenge'], poster: img('p-avenging-angel'),
    rating: 4.8, ratingCount: '22k', year: 2024, episodeCount: 90, minPerEp: '2.5m', pro: true,
  },
  {
    id: 'schicksalsband', title: 'Schicksalsband', tagline: 'Bound by fate. Torn by blood.',
    synopsis: 'Three sisters inherit a curse — and only love can break it.',
    genres: ['Fantasy', 'Drama'], tags: ['Fantasy'], poster: img('p-band-of-fate'),
    rating: 4.3, ratingCount: '2k', year: 2025, episodeCount: 25, minPerEp: '1m',
  },
  {
    id: 'zweite-chance', title: 'Zweite Chance', tagline: 'A new dawn. A new path.',
    synopsis: 'Ten years after the accident, he finally finds the woman who saved his life.',
    genres: ['Romance', 'Drama'], tags: ['Second Chance'], poster: img('p-second-chance'),
    rating: 4.6, ratingCount: '4k', year: 2024, episodeCount: 55, minPerEp: '2m', pro: true,
  },
  {
    id: 'forbidden-vows', title: 'Forbidden Vows', tagline: 'Promised to one. In love with another.',
    synopsis: 'An arranged marriage, a secret lover and a vow that cannot be broken.',
    genres: ['Romance', 'Drama'], tags: ['Arranged Marriage'], poster: img('p-forbidden-vows'),
    rating: 4.5, ratingCount: '3k', year: 2025, episodeCount: 40, minPerEp: '2m',
  },
  {
    id: 'fast-lane', title: 'Love in the Fast Lane', tagline: 'Speed. Danger. Desire.',
    synopsis: 'A street racer and the detective sent to arrest him.',
    genres: ['Romance', 'Action'], tags: ['Enemies to Lovers'], poster: img('p-fast-lane'),
    rating: 4.4, ratingCount: '5k', year: 2025, episodeCount: 50, minPerEp: '2m',
  },
  {
    id: 'heirs-dilemma', title: "The Heir's Dilemma", tagline: 'Inherit the fortune. Lose the girl.',
    synopsis: 'To claim his inheritance he must marry within 30 days — anyone but her.',
    genres: ['Romance', 'Billionaire'], tags: ['Billionaire', 'Inheritance'], poster: img('p-heirs-dilemma'),
    rating: 4.6, ratingCount: '6k', year: 2024, episodeCount: 48, minPerEp: '2m', pro: true,
  },
  {
    id: 'forbidden-love', title: 'Forbidden Love', tagline: 'Some loves are worth every risk.',
    synopsis: 'She is engaged to his brother. He is the only one who sees her.',
    genres: ['Romance'], tags: ['Forbidden Love'], poster: img('p-forbidden-love'),
    rating: 4.7, ratingCount: '15k', year: 2024, episodeCount: 30, minPerEp: '2m',
  },
  {
    id: 'forbidden-secrets', title: 'Forbidden Secrets', tagline: 'Enemies to lovers in the rain.',
    synopsis: 'Two rival detectives. One case. Too many secrets.',
    genres: ['Romance', 'Mystery'], tags: ['Enemies to Lovers'], poster: img('p-forbidden-secrets'),
    rating: 4.5, ratingCount: '4k', year: 2025, episodeCount: 30, minPerEp: '2m',
  },
  {
    id: 'the-ceo-and-i', title: 'The CEO and I', tagline: 'A billionaire romance.',
    synopsis: 'The intern who spilled coffee on the CEO — and then on his secrets.',
    genres: ['Romance', 'Billionaire'], tags: ['Billionaire Romance'], poster: img('p-ceo-library'),
    rating: 4.6, ratingCount: '10k', year: 2024, episodeCount: 60, minPerEp: '2m',
  },
  {
    id: 'second-chance-love', title: 'Second Chance Love', tagline: 'Same beach. Ten years later.',
    synopsis: 'A summer love, a broken promise and one more chance.',
    genres: ['Romance'], tags: ['Second Chance'], poster: img('p-second-chance-love'),
    rating: 4.4, ratingCount: '3k', year: 2024, episodeCount: 30, minPerEp: '2m',
  },
  {
    id: 'royal-contract', title: 'Royal Contract', tagline: 'A crown. A contract. A forbidden heart.',
    synopsis: 'A commoner signs a marriage contract with the crown prince — with a secret clause.',
    genres: ['Romance', 'Drama'], tags: ['Historical Romance'], poster: img('p-royal-contract'),
    rating: 4.7, ratingCount: '9k', year: 2025, episodeCount: 45, minPerEp: '2m', pro: true,
  },
]

export const seriesById = (id: string) => SERIES.find((s) => s.id === id)

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

export function getEpisode(series: Series, n: number): Episode {
  const h = hash(series.id + n)
  const hand = series.script?.[n - 1] ?? {}
  const stills = series.stills ?? [series.poster]
  const frames = series.frames ?? [series.poster]
  return {
    n,
    title: hand.title ?? genericTitles[(n - 1 + h) % genericTitles.length],
    lines: hand.lines ?? genericLines[h % genericLines.length],
    cliff: hand.cliff ?? genericCliffs[h % genericCliffs.length],
    duration: 100 + (h % 120),
    still: stills[(n - 1) % stills.length],
    frame: frames[(n - 1) % frames.length],
  }
}

export function getEpisodes(series: Series, count = series.episodeCount): Episode[] {
  return Array.from({ length: Math.min(count, series.episodeCount) }, (_, i) => getEpisode(series, i + 1))
}

export const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
export const fmtEuro = (v: number) => `€${v.toFixed(2)}`

export const RAILS = {
  trending: ['der-ceo-und-ich', 'mein-geheimes-leben', 'liebe-auf-umwegen', 'the-ceo-and-i', 'heirs-dilemma'],
  forbidden: ['blutige-rosen', 'schattenkuss', 'dunkle-begierde', 'forbidden-love', 'forbidden-vows'],
  mostWatched: ['racheengel', 'schicksalsband', 'zweite-chance', 'fast-lane', 'royal-contract'],
  similar: ['forbidden-vows', 'fast-lane', 'heirs-dilemma', 'royal-contract'],
  featured: ['verbotene-liebe', 'ceos-secret-life', 'billionaires-secret'],
}
