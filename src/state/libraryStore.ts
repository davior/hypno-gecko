import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LibraryStore {
  bookmarks: string[]
  toggleBookmark: (id: string) => void
}

/** Bookmarked frequency entries, persisted locally (offline-first). */
export const useLibrary = create<LibraryStore>()(
  persist(
    (set) => ({
      bookmarks: [],
      toggleBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(id)
            ? state.bookmarks.filter((b) => b !== id)
            : [...state.bookmarks, id],
        })),
    }),
    { name: 'hypno-gecko-library' },
  ),
)
