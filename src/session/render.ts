import {
  binauralFrequencies,
  clamp,
  monauralFrequencies,
  pulseOnDuration,
  pulsePeriod,
  rampedBeatAt,
} from '../audio/beatMath'
import { AmbientLayer } from '../audio/layers/AmbientLayer'
import type { GeneratorConfig } from '../audio/types'
import { audioBufferToWav } from '../audio/wav'
import { mainBeat } from './schedule'
import { MAX_EXPORT_SEC, type SessionConfig } from './types'

const SAMPLE_RATE = 44100

type OfflineCtor = new (
  channels: number,
  length: number,
  sampleRate: number,
) => OfflineAudioContext

export function isExportSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    (typeof window.OfflineAudioContext !== 'undefined' ||
      typeof (window as { webkitOfflineAudioContext?: unknown })
        .webkitOfflineAudioContext !== 'undefined')
  )
}

/**
 * Render the main phase's beat + ambient bed to a WAV Blob via an
 * OfflineAudioContext. Spoken affirmations are not included (browser speech
 * can't be captured offline). Length is capped by MAX_EXPORT_SEC.
 */
export async function renderBedToWav(session: SessionConfig): Promise<Blob> {
  const durationSec = Math.min(session.main.durationSec, MAX_EXPORT_SEC)
  const beat = mainBeat(session)
  const length = Math.ceil(durationSec * SAMPLE_RATE)

  const Ctor =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext: OfflineCtor })
      .webkitOfflineAudioContext
  const ctx = new Ctor(2, length, SAMPLE_RATE)

  const master = ctx.createGain()
  master.gain.value = clamp(beat.masterVolume, 0, 1)
  master.connect(ctx.destination)

  buildOfflineBeat(ctx, beat, durationSec).connect(master)

  if (session.main.ambient.enabled) {
    const ambient = new AmbientLayer(ctx, session.main.ambient)
    ambient.output.connect(master)
    ambient.start()
  }

  const rendered = await ctx.startRendering()
  return audioBufferToWav(rendered)
}

function buildOfflineBeat(
  ctx: BaseAudioContext,
  cfg: GeneratorConfig,
  duration: number,
): AudioNode {
  const out = ctx.createGain()
  const startBeat = cfg.beatHz
  const endBeat = cfg.ramp.enabled ? cfg.ramp.targetBeatHz : cfg.beatHz
  const rampDur = cfg.ramp.enabled
    ? Math.min(cfg.ramp.durationSec || duration, duration)
    : 0

  if (cfg.method === 'binaural') {
    const merger = ctx.createChannelMerger(2)
    const l = ctx.createOscillator()
    const r = ctx.createOscillator()
    l.type = cfg.waveform
    r.type = cfg.waveform
    const s = binauralFrequencies(cfg.carrierHz, startBeat)
    const e = binauralFrequencies(cfg.carrierHz, endBeat)
    l.frequency.setValueAtTime(s.left, 0)
    r.frequency.setValueAtTime(s.right, 0)
    if (rampDur > 0) {
      l.frequency.linearRampToValueAtTime(e.left, rampDur)
      r.frequency.linearRampToValueAtTime(e.right, rampDur)
    }
    l.connect(merger, 0, 0)
    r.connect(merger, 0, 1)
    merger.connect(out)
    startStop([l, r], duration)
  } else if (cfg.method === 'monaural') {
    const a = ctx.createOscillator()
    const b = ctx.createOscillator()
    a.type = cfg.waveform
    b.type = cfg.waveform
    const ga = ctx.createGain()
    const gb = ctx.createGain()
    ga.gain.value = 0.5
    gb.gain.value = 0.5
    const s = monauralFrequencies(cfg.carrierHz, startBeat)
    const e = monauralFrequencies(cfg.carrierHz, endBeat)
    a.frequency.value = s.a
    b.frequency.setValueAtTime(s.b, 0)
    if (rampDur > 0) b.frequency.linearRampToValueAtTime(e.b, rampDur)
    a.connect(ga).connect(out)
    b.connect(gb).connect(out)
    startStop([a, b], duration)
  } else if (cfg.method === 'am') {
    const carrier = ctx.createOscillator()
    carrier.type = cfg.waveform
    carrier.frequency.value = cfg.carrierHz
    const modGain = ctx.createGain()
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    const depthGain = ctx.createGain()
    const depth = clamp(cfg.modDepth, 0, 1)
    const min = 1 - depth
    modGain.gain.value = (min + 1) / 2
    depthGain.gain.value = (1 - min) / 2
    lfo.frequency.setValueAtTime(startBeat, 0)
    if (rampDur > 0) lfo.frequency.linearRampToValueAtTime(endBeat, rampDur)
    lfo.connect(depthGain).connect(modGain.gain)
    carrier.connect(modGain).connect(out)
    startStop([carrier, lfo], duration)
  } else {
    const osc = ctx.createOscillator()
    osc.type = cfg.waveform
    osc.frequency.value = cfg.carrierHz
    const gate = ctx.createGain()
    gate.gain.value = 0
    osc.connect(gate).connect(out)
    scheduleIsochronicGate(
      gate.gain,
      startBeat,
      endBeat,
      rampDur,
      duration,
      cfg.dutyCycle,
      cfg.gateRampMs,
    )
    osc.start(0)
    osc.stop(duration)
  }

  return out
}

function startStop(oscs: OscillatorNode[], duration: number): void {
  for (const o of oscs) {
    o.start(0)
    o.stop(duration)
  }
}

function scheduleIsochronicGate(
  gain: AudioParam,
  startBeat: number,
  endBeat: number,
  rampDur: number,
  duration: number,
  duty: number,
  gateRampMs: number,
): void {
  let t = 0
  let count = 0
  while (t < duration && count < 200000) {
    const beat = rampDur > 0 ? rampedBeatAt(startBeat, endBeat, rampDur, t) : startBeat
    const period = pulsePeriod(beat)
    const on = pulseOnDuration(beat, duty)
    const ramp = Math.min(gateRampMs / 1000, on / 2)
    gain.setValueAtTime(0, t)
    gain.linearRampToValueAtTime(1, Math.min(t + ramp, duration))
    gain.setValueAtTime(1, Math.min(t + on - ramp, duration))
    gain.linearRampToValueAtTime(0, Math.min(t + on, duration))
    t += period
    count++
  }
}
