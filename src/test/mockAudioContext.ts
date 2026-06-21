/**
 * A minimal Web Audio mock — jsdom doesn't implement the Web Audio API, so we
 * stand in just enough of it to exercise the Voice node-graph wiring.
 *
 * Nodes record the values and connections the voices set so tests can assert
 * against them without real audio hardware.
 */

export interface MockParam {
  value: number
  events: Array<{ method: string; value: number; time: number }>
  setValueAtTime(value: number, time: number): MockParam
  linearRampToValueAtTime(value: number, time: number): MockParam
  setTargetAtTime(value: number, time: number, constant: number): MockParam
  cancelScheduledValues(time: number): MockParam
}

function makeParam(initial: number): MockParam {
  const param: MockParam = {
    value: initial,
    events: [],
    setValueAtTime(value, time) {
      param.events.push({ method: 'setValueAtTime', value, time })
      param.value = value
      return param
    },
    linearRampToValueAtTime(value, time) {
      param.events.push({ method: 'linearRampToValueAtTime', value, time })
      param.value = value
      return param
    },
    setTargetAtTime(value, time) {
      param.events.push({ method: 'setTargetAtTime', value, time })
      param.value = value
      return param
    },
    cancelScheduledValues(time) {
      param.events.push({ method: 'cancelScheduledValues', value: 0, time })
      return param
    },
  }
  return param
}

export interface MockNode {
  kind: string
  connections: MockNode[]
  connect(dest: MockNode, output?: number, input?: number): MockNode
  disconnect(): void
}

function makeNode(kind: string, extra: Record<string, unknown> = {}): MockNode {
  const node: MockNode = {
    kind,
    connections: [],
    connect(dest) {
      node.connections.push(dest)
      return dest
    },
    disconnect() {
      node.connections.length = 0
    },
    ...extra,
  }
  return node
}

export interface MockOscillator extends MockNode {
  type: OscillatorType
  frequency: MockParam
  detune: MockParam
  started: boolean
  stopped: boolean
  start(): void
  stop(): void
}

export interface MockGain extends MockNode {
  gain: MockParam
}

export interface MockBufferSource extends MockNode {
  buffer: unknown
  loop: boolean
  started: boolean
  stopped: boolean
  start(): void
  stop(): void
}

export interface MockBiquadFilter extends MockNode {
  type: BiquadFilterType
  frequency: MockParam
}

interface MockAudioBuffer {
  length: number
  sampleRate: number
  numberOfChannels: number
  getChannelData(channel: number): Float32Array
}

export interface MockAudioContextLike {
  currentTime: number
  sampleRate: number
  oscillators: MockOscillator[]
  gains: MockGain[]
  bufferSources: MockBufferSource[]
  filters: MockBiquadFilter[]
  createOscillator(): MockOscillator
  createGain(): MockGain
  createChannelMerger(channels?: number): MockNode
  createStereoPanner(): MockNode & { pan: MockParam }
  createBufferSource(): MockBufferSource
  createBiquadFilter(): MockBiquadFilter
  createBuffer(channels: number, length: number, sampleRate: number): MockAudioBuffer
}

export function createMockAudioContext(): MockAudioContextLike {
  const oscillators: MockOscillator[] = []
  const gains: MockGain[] = []
  const bufferSources: MockBufferSource[] = []
  const filters: MockBiquadFilter[] = []

  return {
    currentTime: 0,
    sampleRate: 48000,
    oscillators,
    gains,
    bufferSources,
    filters,
    createOscillator() {
      const osc = makeNode('oscillator', {
        type: 'sine',
        frequency: makeParam(440),
        detune: makeParam(0),
        started: false,
        stopped: false,
        start() {
          ;(osc as MockOscillator).started = true
        },
        stop() {
          ;(osc as MockOscillator).stopped = true
        },
      }) as MockOscillator
      oscillators.push(osc)
      return osc
    },
    createGain() {
      const gain = makeNode('gain', { gain: makeParam(1) }) as MockGain
      gains.push(gain)
      return gain
    },
    createChannelMerger() {
      return makeNode('merger')
    },
    createStereoPanner() {
      return makeNode('panner', { pan: makeParam(0) }) as MockNode & {
        pan: MockParam
      }
    },
    createBufferSource() {
      const src = makeNode('bufferSource', {
        buffer: null,
        loop: false,
        started: false,
        stopped: false,
        start() {
          ;(src as MockBufferSource).started = true
        },
        stop() {
          ;(src as MockBufferSource).stopped = true
        },
      }) as MockBufferSource
      bufferSources.push(src)
      return src
    },
    createBiquadFilter() {
      const filter = makeNode('filter', {
        type: 'lowpass',
        frequency: makeParam(350),
      }) as MockBiquadFilter
      filters.push(filter)
      return filter
    },
    createBuffer(channels, length, sampleRate) {
      const data: Float32Array[] = Array.from(
        { length: channels },
        () => new Float32Array(length),
      )
      return {
        length,
        sampleRate,
        numberOfChannels: channels,
        getChannelData: (channel: number) => data[channel],
      }
    },
  }
}
