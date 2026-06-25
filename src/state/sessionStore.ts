import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AmbientConfig, BeatRamp, GeneratorConfig } from '../audio/types'
import { SESSION_TEMPLATES } from '../data/sessionTemplates'
import {
  DEFAULT_SESSION,
  type EmergenceConfig,
  type InductionConfig,
  type SessionConfig,
  type SessionMain,
} from '../session/types'
import { uid } from '../utils/id'

/** Deep clone of plain session data (cross-browser, no structuredClone needed). */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

interface SessionStore {
  session: SessionConfig
  saved: SessionConfig[]

  applyTemplate: (templateId: string) => void
  patch: (p: Partial<SessionConfig>) => void
  patchInduction: (p: Partial<InductionConfig>) => void
  patchEmergence: (p: Partial<EmergenceConfig>) => void
  patchMain: (p: Partial<SessionMain>) => void
  patchBeat: (p: Partial<GeneratorConfig>) => void
  patchRamp: (p: Partial<BeatRamp>) => void
  patchAmbient: (p: Partial<AmbientConfig>) => void

  save: () => void
  loadSaved: (id: string) => void
  deleteSaved: (id: string) => void
  /** Replace the working session from pasted/loaded JSON; false if invalid. */
  importSession: (json: string) => boolean
}

export const useSession = create<SessionStore>()(
  persist(
    (set, get) => ({
      session: { ...clone(DEFAULT_SESSION), id: uid('sess') },
      saved: [],

      applyTemplate: (templateId) => {
        const t = SESSION_TEMPLATES.find((x) => x.id === templateId)
        if (!t) return
        set({ session: { ...clone(t.session), id: uid('sess') } })
      },

      patch: (p) => set((s) => ({ session: { ...s.session, ...p } })),

      patchInduction: (p) =>
        set((s) => ({
          session: { ...s.session, induction: { ...s.session.induction, ...p } },
        })),

      patchEmergence: (p) =>
        set((s) => ({
          session: { ...s.session, emergence: { ...s.session.emergence, ...p } },
        })),

      patchMain: (p) =>
        set((s) => ({
          session: { ...s.session, main: { ...s.session.main, ...p } },
        })),

      patchBeat: (p) =>
        set((s) => ({
          session: {
            ...s.session,
            main: { ...s.session.main, beat: { ...s.session.main.beat, ...p } },
          },
        })),

      patchRamp: (p) =>
        set((s) => ({
          session: {
            ...s.session,
            main: {
              ...s.session.main,
              beat: {
                ...s.session.main.beat,
                ramp: { ...s.session.main.beat.ramp, ...p },
              },
            },
          },
        })),

      patchAmbient: (p) =>
        set((s) => ({
          session: {
            ...s.session,
            main: {
              ...s.session.main,
              ambient: { ...s.session.main.ambient, ...p },
            },
          },
        })),

      save: () => {
        const cur = get().session
        const snapshot = { ...clone(cur), id: uid('sess') }
        set((s) => ({
          saved: [...s.saved.filter((x) => x.name !== cur.name), snapshot],
        }))
      },

      loadSaved: (id) => {
        const found = get().saved.find((x) => x.id === id)
        if (found) set({ session: { ...clone(found), id: uid('sess') } })
      },

      deleteSaved: (id) =>
        set((s) => ({ saved: s.saved.filter((x) => x.id !== id) })),

      importSession: (json) => {
        try {
          const parsed = JSON.parse(json) as SessionConfig
          if (!parsed?.main?.beat || !parsed.induction || !parsed.emergence) {
            return false
          }
          set({ session: { ...parsed, id: uid('sess') } })
          return true
        } catch {
          return false
        }
      },
    }),
    { name: 'hypno-gecko-sessions' },
  ),
)
