import { create } from 'zustand'
import { AudioEngine, audioEngine, type EngineState } from '../audio/AudioEngine'
import {
  DEFAULT_CONFIG,
  type BeatMethod,
  type BeatRamp,
  type GeneratorConfig,
} from '../audio/types'

interface GeneratorStore {
  config: GeneratorConfig
  engineState: EngineState
  supported: boolean

  /** Merge a partial patch into the config (and push to the engine if live). */
  setConfig: (patch: Partial<GeneratorConfig>) => void
  setRamp: (patch: Partial<BeatRamp>) => void
  setMethod: (method: BeatMethod) => void
  /** Jump the beat to a band's default frequency. */
  selectBeat: (beatHz: number) => void

  play: () => Promise<void>
  stop: () => void
  toggle: () => Promise<void>
}

export const useGenerator = create<GeneratorStore>((set, get) => {
  // Mirror engine playback state into the store.
  audioEngine.subscribe((engineState) => set({ engineState }))

  const pushIfLive = (config: GeneratorConfig) => {
    if (audioEngine.isPlaying) audioEngine.update(config)
  }

  return {
    config: DEFAULT_CONFIG,
    engineState: 'idle',
    supported: AudioEngine.isSupported,

    setConfig: (patch) => {
      const config = { ...get().config, ...patch }
      set({ config })
      pushIfLive(config)
    },

    setRamp: (patch) => {
      const current = get().config
      const config = { ...current, ramp: { ...current.ramp, ...patch } }
      set({ config })
      pushIfLive(config)
    },

    setMethod: (method) => {
      const config = { ...get().config, method }
      set({ config })
      // Method change rebuilds the graph, so restart if currently playing.
      if (audioEngine.isPlaying) void audioEngine.play(config)
    },

    selectBeat: (beatHz) => {
      const config = { ...get().config, beatHz }
      set({ config })
      pushIfLive(config)
    },

    play: async () => {
      await audioEngine.play(get().config)
    },
    stop: () => audioEngine.stop(),
    toggle: async () => {
      if (audioEngine.isPlaying) audioEngine.stop()
      else await audioEngine.play(get().config)
    },
  }
})
