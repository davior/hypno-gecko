import type { NoiseType } from '../audio/types'

export interface NoiseTypeInfo {
  id: NoiseType
  name: string
  blurb: string
}

/**
 * The synthesizable ambient textures (Module 4). Sample-based environments
 * (rain, ocean, forest, Tibetan bowls) arrive with an asset pipeline in a
 * later phase; coloured noise is generated entirely in the browser.
 */
export const NOISE_TYPES: NoiseTypeInfo[] = [
  {
    id: 'white',
    name: 'White',
    blurb: 'Bright, full-spectrum hiss — masks distractions.',
  },
  {
    id: 'pink',
    name: 'Pink',
    blurb: 'Balanced and natural — softer than white, like steady rain.',
  },
  {
    id: 'brown',
    name: 'Brown',
    blurb: 'Deep, warm rumble — distant surf or a low waterfall.',
  },
]
