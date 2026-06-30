/** Avatares DiceBear (bottts) — seeds distintos para personagens únicos */
export const PACE_AVATAR_OPTIONS = [
    { id: 'felix', label: 'Felix', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
    { id: 'aneka', label: 'Aneka', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka' },
    { id: 'buddy', label: 'Buddy', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Buddy' },
    { id: 'coco', label: 'Coco', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Coco' },
    { id: 'luna', label: 'Luna', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Luna' },
    { id: 'max', label: 'Max', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Max' },
    { id: 'pixel', label: 'Pixel', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pixel' },
    { id: 'zara', label: 'Zara', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zara' },
] as const

export const DEFAULT_PACE_AVATAR = PACE_AVATAR_OPTIONS[0].url
