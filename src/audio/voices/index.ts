import type { GeneratorConfig } from '../types'
import { AmVoice } from './AmVoice'
import { BinauralVoice } from './BinauralVoice'
import { IsochronicVoice } from './IsochronicVoice'
import { MonauralVoice } from './MonauralVoice'
import type { Voice } from './Voice'

export type { Voice } from './Voice'
export { BinauralVoice, MonauralVoice, AmVoice, IsochronicVoice }

/** Construct the Voice for a given beat method. */
export function createVoice(ctx: BaseAudioContext, config: GeneratorConfig): Voice {
  switch (config.method) {
    case 'binaural':
      return new BinauralVoice(ctx, config)
    case 'monaural':
      return new MonauralVoice(ctx, config)
    case 'am':
      return new AmVoice(ctx, config)
    case 'isochronic':
      return new IsochronicVoice(ctx, config)
  }
}
