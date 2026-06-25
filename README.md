# 🦎 Hypno Gecko

**Audio Frequency & Self-Hypnosis Generator** — a self-directed neuroacoustic
tool for brainwave entrainment and personalized affirmation programming, running
entirely in the browser.

> The premise: altered states are a technology, and that technology should be
> open and accessible. No therapist required, no gatekeeping.

> ⚠️ **For personal wellness and exploration — not a medical device.** It does
> not diagnose, treat, or cure any condition. See the in-app _About_ page for
> full responsible-use guidance.

---

## Status

This is an in-progress build. The work is split into phases:

| Phase | Scope | State |
| ----- | ----- | ----- |
| **0** | Project foundation — Vite + React + TS + Tailwind, app shell, routing, tests | ✅ Done |
| **1** | **Frequency & Beat Generator** — Web Audio engine, 4 entrainment methods, brainwave selector, ramping, Solfeggio/Schumann presets | ✅ Done |
| **2** | Ambient sound layer + browsable Frequency Library | ✅ Done |
| **3** | Affirmation engine + text-to-speech | ✅ Done |
| **4** | Session builder + induction / emergence (orchestration, templates, JSON, WAV export) | ✅ Done |
| 5 | Session journal & tracking, offline/PWA, adaptive intelligence | ⏳ Next |

_Phase 4 follow-ups (4b): full drag/resize DAW timeline, MP3/FLAC export, and
spoken affirmations baked into exported audio._

### What works today

**Frequency & Beat Generator (Phase 1)**

- **Four entrainment methods**, each a real Web Audio node graph:
  - **Binaural** — detuned tone per ear (headphones required)
  - **Monaural** — two tones summed before output (no headphones)
  - **AM** — amplitude-modulated carrier
  - **Isochronic** — gated pulses with duty-cycle & edge-softness control
- **Brainwave band selector** (Delta → Gamma) with sensible default beats
- **Carrier + beat controls**, master volume, smooth fade in/out
- **Frequency ramping** — glide the beat over a session (e.g. Alpha → Theta)
- **Solfeggio & Schumann presets** as one-tap carrier / beat targets
- A soft **live visual** pulse and built-in **responsible-use** guidance

**Ambient + Library (Phase 2)**

- **Ambient layer** — browser-generated white/pink/brown noise mixed beneath
  the beats, with its own volume and tone, toggleable live mid-session
- **Frequency Library** — searchable 6-category reference with honest
  evidence-tier tags, bookmarks (saved offline), cross-references, and
  one-click "load into generator"

**Affirmations + TTS (Phase 3)**

- **Affirmation libraries** — write, tag, edit, weight, and import (.txt/.csv)
  affirmation sets, persisted locally
- **Spoken delivery** via the Web Speech API — voice, rate, pitch, volume, plus
  repetition, linear/shuffle/weighted **sequencing**, and inter-statement gaps

**Session Builder (Phase 4)**

- **Guided sessions** — induction → main → emergence orchestrated over a live
  timeline (spoken countdown / PMR / breathing inductions, a beat-sweep, timed
  affirmations through the main block, and a count-up emergence)
- **6 prebuilt templates**, **JSON** save/load, and **WAV export** of the
  beat+ambient bed (rendered offline via `OfflineAudioContext`)

## Architecture

The audio core is deliberately decoupled so it can be reasoned about and tested
without a browser:

```
src/
  audio/            Web Audio engine (framework-free)
    beatMath.ts       pure math (binaural split, AM envelope, ramps) — unit tested
    types.ts          GeneratorConfig + safe limits
    voices/           one node-graph per method (Binaural/Monaural/Am/Isochronic)
    AudioEngine.ts    AudioContext lifecycle, master gain, ramp scheduler
  data/             brainwave bands, method metadata, frequency presets
  state/            Zustand store bridging UI ⇄ engine
  components/       app shell + reusable UI primitives
  features/         generator/, about/
  test/             setup + a minimal Web Audio mock
```

Voices depend only on `BaseAudioContext`, so the node graphs are verified in
tests against a lightweight mock context.

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

Then open the printed URL and press play (start at a low volume).

### Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run test` | Run the Vitest suite |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Browser support

Works in current **Chrome, Edge, Firefox, and Safari**. The Generator, Library,
and affirmation editing are fully cross-browser (built on the standard Web Audio
API).

**Text-to-speech** has two engines:

- **Browser (Web Speech API)** — uses your operating system's installed voices.
  Quality and availability vary by OS/browser; **Firefox on Linux often ships no
  voices at all**. Playback never hangs — a watchdog always advances the
  sequence — and the UI tells you when no voices are found.
- **Deepgram (optional)** — paste your own [Deepgram](https://deepgram.com) API
  key to use their cloud Aura voices, which work in any browser regardless of OS
  voices. Affirmation text is sent to Deepgram to synthesise speech (so it needs
  a network connection); the key is stored only in your browser's local storage.
  Note: if Deepgram blocks direct browser (CORS) requests for your account, the
  call fails with a clear message and a small proxy would be needed.

## Tech

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Web Audio API ·
Web Speech / Deepgram TTS · Vitest. Fully client-side — no backend required.
