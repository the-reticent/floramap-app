import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Species, UserLocation, FilterState, GardenDesign } from '../types'

interface AppState {
  // Location
  location:        UserLocation | null
  locationError:   string | null
  setLocation:     (loc: UserLocation) => void
  setLocationError:(err: string) => void

  // Species for current location
  nativePlants:    Species[]
  vegTypeName:     string | null
  vegTypeCode:     string | null
  biome:           string | null
  plantsLoading:   boolean
  plantsError:     string | null
  setNativePlants: (plants: Species[], vegTypeName: string, vegTypeCode: string, biome: string) => void
  setPlantsLoading:(loading: boolean) => void
  setPlantsError:  (error: string | null) => void

  // Selected species
  selectedSpecies: Species | null
  setSelectedSpecies: (s: Species | null) => void

  // Filters
  filters:         FilterState
  setFilters:      (f: Partial<FilterState>) => void
  resetFilters:    () => void

  // Saved / favourites (persisted)
  savedSpecies:    string[]   // accepted_name array
  toggleSaved:     (name: string) => void
  isSaved:         (name: string) => boolean

  // Garden designs (persisted)
  designs:         GardenDesign[]
  addDesign:       (d: GardenDesign) => void
  updateDesign:    (id: string, d: Partial<GardenDesign>) => void
  removeDesign:    (id: string) => void
}

const defaultFilters: FilterState = {
  growth_forms:      [],
  water_use:         [],
  sun_exposure:      [],
  edible_only:       false,
  medicinal_only:    false,
  fire_adapted_only: false,
  search_query:      '',
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Location
      location:        null,
      locationError:   null,
      setLocation:     (loc) => set({ location: loc, locationError: null }),
      setLocationError:(err) => set({ locationError: err }),

      // Plants
      nativePlants:    [],
      vegTypeName:     null,
      vegTypeCode:     null,
      biome:           null,
      plantsLoading:   false,
      plantsError:     null,
      setNativePlants: (plants, vegTypeName, vegTypeCode, biome) =>
        set({ nativePlants: plants, vegTypeName, vegTypeCode, biome, plantsError: null }),
      setPlantsLoading:(loading) => set({ plantsLoading: loading }),
      setPlantsError:  (error)   => set({ plantsError: error }),

      // Selected
      selectedSpecies:    null,
      setSelectedSpecies: (s) => set({ selectedSpecies: s }),

      // Filters
      filters:     defaultFilters,
      setFilters:  (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      resetFilters:() => set({ filters: defaultFilters }),

      // Saved
      savedSpecies: [],
      toggleSaved:  (name) => set((s) => ({
        savedSpecies: s.savedSpecies.includes(name)
          ? s.savedSpecies.filter((n) => n !== name)
          : [...s.savedSpecies, name],
      })),
      isSaved: (name) => get().savedSpecies.includes(name),

      // Designs
      designs:      [],
      addDesign:    (d) => set((s) => ({ designs: [d, ...s.designs] })),
      updateDesign: (id, d) => set((s) => ({
        designs: s.designs.map((x) => x.id === id ? { ...x, ...d } : x),
      })),
      removeDesign: (id) => set((s) => ({
        designs: s.designs.filter((x) => x.id !== id),
      })),
    }),
    {
      name:    'floramap-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist saved + designs — not ephemeral state
      partialize: (s) => ({
        savedSpecies: s.savedSpecies,
        designs:      s.designs,
      }),
    }
  )
)
