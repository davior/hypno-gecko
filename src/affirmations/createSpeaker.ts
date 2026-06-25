import { DeepgramSpeaker } from './DeepgramSpeaker'
import { WebSpeechSpeaker, type Speaker } from './speech'
import type { TtsConfig } from './types'

/** Build the Speaker for the configured TTS engine. */
export function createSpeaker(tts: TtsConfig): Speaker {
  if (tts.engine === 'deepgram') {
    return new DeepgramSpeaker({
      apiKey: tts.deepgramKey,
      model: tts.deepgramModel,
    })
  }
  return new WebSpeechSpeaker()
}
