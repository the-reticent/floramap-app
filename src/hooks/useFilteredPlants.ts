import { useMemo } from 'react'
import { useAppStore } from '../store'
import { Species } from '../types'

export function useFilteredPlants(plants: Species[]) {
  const { filters } = useAppStore()

  return useMemo(() => {
    let result = [...plants]

    if (filters.search_query.trim()) {
      const q = filters.search_query.toLowerCase()
      result = result.filter(
        (s) =>
          s.accepted_name.toLowerCase().includes(q) ||
          s.common_name_en?.toLowerCase().includes(q) ||
          s.common_name_af?.toLowerCase().includes(q) ||
          s.genus?.toLowerCase().includes(q)
      )
    }

    if (filters.growth_forms.length > 0) {
      result = result.filter((s) =>
        filters.growth_forms.some((gf) =>
          s.growth_form?.toLowerCase().includes(gf.toLowerCase())
        )
      )
    }

    if (filters.water_use.length > 0) {
      result = result.filter((s) =>
        filters.water_use.some((w) =>
          s.water_use?.toLowerCase().includes(w.toLowerCase())
        )
      )
    }

    if (filters.sun_exposure.length > 0) {
      result = result.filter((s) =>
        filters.sun_exposure.some((e) =>
          s.sun_exposure?.toLowerCase().includes(e.toLowerCase())
        )
      )
    }

    if (filters.edible_only)       result = result.filter((s) => s.edible)
    if (filters.medicinal_only)    result = result.filter((s) => s.medicinal)
    if (filters.fire_adapted_only) result = result.filter((s) => s.fire_adapted)

    return result
  }, [plants, filters])
}
