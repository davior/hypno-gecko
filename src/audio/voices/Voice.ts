import type { GeneratorConfig } from '../types'

/**
 * A Voice owns one realisation of a beat method as a Web Audio node graph.
 *
 * Oscillators can only be started/stopped once, so a Voice is single-use:
 * the engine constructs a fresh Voice every time playback starts and
 * disposes it on stop.
 *
 * Voices depend only on `BaseAudioContext` (not the concrete `AudioContext`)
 * so they can be exercised against a mock context in tests.
 */
export interface Voice {
  /** Final output node — connect this to the engine's master gain. */
  readonly output: AudioNode
  /** Begin sound generation. */
  start(): void
  /** Stop sound generation. Safe to call once. */
  stop(): void
  /** Re-apply config to live parameters (carrier/beat/depth/etc.). */
  update(config: GeneratorConfig): void
  /** Tear down the graph and release references. */
  dispose(): void
}

/** Shared base wiring: an output GainNode plus tidy disposal. */
export abstract class BaseVoice implements Voice {
  readonly output: GainNode
  protected started = false
  protected stopped = false
  protected readonly nodes: { disconnect(): void }[] = []

  constructor(protected readonly ctx: BaseAudioContext) {
    this.output = ctx.createGain()
  }

  abstract update(config: GeneratorConfig): void
  abstract start(): void
  abstract stop(): void

  protected track<T extends { disconnect(): void }>(node: T): T {
    this.nodes.push(node)
    return node
  }

  dispose(): void {
    for (const node of this.nodes) {
      try {
        node.disconnect()
      } catch {
        // already disconnected
      }
    }
    try {
      this.output.disconnect()
    } catch {
      // already disconnected
    }
    this.nodes.length = 0
  }
}
