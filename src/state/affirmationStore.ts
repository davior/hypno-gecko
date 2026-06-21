import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ParsedAffirmation } from '../affirmations/parse'
import {
  DEFAULT_DELIVERY,
  type Affirmation,
  type AffirmationSet,
  type DeliveryConfig,
} from '../affirmations/types'
import { uid } from '../utils/id'

function makeAffirmation(text: string, weight = 1): Affirmation {
  return { id: uid('aff'), text, weight }
}

function seedSet(): AffirmationSet {
  const now = Date.now()
  return {
    id: uid('set'),
    name: 'Quiet Confidence',
    tags: ['confidence', 'example'],
    createdAt: now,
    updatedAt: now,
    affirmations: [
      makeAffirmation('I am calm, capable, and at ease with people.', 2),
      makeAffirmation('I am someone who naturally connects with others.', 1),
      makeAffirmation('Every day I find it easier to speak my truth.', 1),
      makeAffirmation('I trust myself and my decisions.', 1),
    ],
  }
}

interface AffirmationStore {
  sets: AffirmationSet[]
  activeSetId: string | null
  delivery: DeliveryConfig

  createSet: (name: string) => string
  renameSet: (id: string, name: string) => void
  deleteSet: (id: string) => void
  selectSet: (id: string) => void
  setTags: (id: string, tags: string[]) => void

  addAffirmation: (setId: string, text: string, weight?: number) => void
  updateAffirmation: (
    setId: string,
    affId: string,
    patch: Partial<Pick<Affirmation, 'text' | 'weight'>>,
  ) => void
  deleteAffirmation: (setId: string, affId: string) => void
  importToSet: (setId: string, parsed: ParsedAffirmation[]) => void

  setDelivery: (patch: Partial<DeliveryConfig>) => void
}

export const useAffirmations = create<AffirmationStore>()(
  persist(
    (set) => {
      const mutateSet = (
        id: string,
        fn: (s: AffirmationSet) => AffirmationSet,
      ) =>
        set((state) => ({
          sets: state.sets.map((s) =>
            s.id === id ? { ...fn(s), updatedAt: Date.now() } : s,
          ),
        }))

      return {
        sets: [seedSet()],
        activeSetId: null,
        delivery: DEFAULT_DELIVERY,

        createSet: (name) => {
          const now = Date.now()
          const newSet: AffirmationSet = {
            id: uid('set'),
            name: name.trim() || 'Untitled set',
            tags: [],
            affirmations: [],
            createdAt: now,
            updatedAt: now,
          }
          set((state) => ({
            sets: [...state.sets, newSet],
            activeSetId: newSet.id,
          }))
          return newSet.id
        },

        renameSet: (id, name) =>
          mutateSet(id, (s) => ({ ...s, name: name.trim() || s.name })),

        deleteSet: (id) =>
          set((state) => {
            const sets = state.sets.filter((s) => s.id !== id)
            const activeSetId =
              state.activeSetId === id
                ? (sets[0]?.id ?? null)
                : state.activeSetId
            return { sets, activeSetId }
          }),

        selectSet: (id) => set({ activeSetId: id }),

        setTags: (id, tags) => mutateSet(id, (s) => ({ ...s, tags })),

        addAffirmation: (setId, text, weight = 1) => {
          const trimmed = text.trim()
          if (!trimmed) return
          mutateSet(setId, (s) => ({
            ...s,
            affirmations: [...s.affirmations, makeAffirmation(trimmed, weight)],
          }))
        },

        updateAffirmation: (setId, affId, patch) =>
          mutateSet(setId, (s) => ({
            ...s,
            affirmations: s.affirmations.map((a) =>
              a.id === affId ? { ...a, ...patch } : a,
            ),
          })),

        deleteAffirmation: (setId, affId) =>
          mutateSet(setId, (s) => ({
            ...s,
            affirmations: s.affirmations.filter((a) => a.id !== affId),
          })),

        importToSet: (setId, parsed) => {
          if (parsed.length === 0) return
          mutateSet(setId, (s) => ({
            ...s,
            affirmations: [
              ...s.affirmations,
              ...parsed.map((p) => makeAffirmation(p.text, p.weight)),
            ],
          }))
        },

        setDelivery: (patch) =>
          set((state) => ({ delivery: { ...state.delivery, ...patch } })),
      }
    },
    {
      name: 'hypno-gecko-affirmations',
      // Ensure a selection survives rehydration.
      onRehydrateStorage: () => (state) => {
        if (state && !state.activeSetId && state.sets.length > 0) {
          state.activeSetId = state.sets[0].id
        }
      },
    },
  ),
)
