// ─── Core domain types ────────────────────────────────────────────────────────

export interface VegetationType {
  veg_type_code: string
  name: string
  biome: string
  bioregion: string
  threat_status: string
  province: string
}

export interface Species {
  id: string
  accepted_name: string
  common_name_en: string
  common_name_af: string
  family: string
  genus: string
  growth_form: string
  deciduous_evergreen: string
  mature_height_cm: number
  mature_spread_cm: number
  bloom_months: string[]
  fruit_months: string[]
  water_use: string
  sun_exposure: string
  soil_texture: string
  soil_ph_range: string
  fire_adapted: boolean
  edible: boolean
  edible_notes?: string
  medicinal: boolean
  medicinal_notes?: string
  conservation_status: string
  notes: string
  sanbi_pza_url: string
  gbif_taxon_key: string
  // Joined fields from get_native_plants()
  veg_type_code?: string
  vegetation_type?: string
  biome?: string
  nativeness?: string
  // Enriched locally
  images?: SpeciesImage[]
  pollinators?: string[]
}

export interface SpeciesImage {
  id: string
  species_id: string
  url: string
  attribution: string
  license: string
  season?: string
  part_shown?: string
  is_primary: boolean
}

export interface UserLocation {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface GardenDesign {
  id: string
  user_id: string
  name: string
  veg_type_code: string
  photo_url?: string
  species_placements: SpeciesPlacement[]
  created_at: string
  updated_at: string
}

export interface SpeciesPlacement {
  species_id: string
  accepted_name: string
  x_percent: number   // position in photo as % 0–100
  y_percent: number
  size_px: number
}

export type WaterUse = 'Extremely low' | 'Very low' | 'Low' | 'Low to moderate' | 'Moderate' | 'Moderate to high' | 'High'
export type SunExposure = 'Full sun' | 'Full sun to part shade' | 'Part shade' | 'Full sun to deep shade' | 'Deep shade'
export type GrowthForm = 'Tree' | 'Large shrub' | 'Medium shrub' | 'Small shrub' | 'Groundcover' | 'Geophyte' | 'Reed' | 'Succulent' | 'Perennial' | 'Annual' | 'Climber'

export type BiomeKey = 'Fynbos' | 'Succulent Karoo' | 'Nama-Karoo' | 'Albany Thicket' | 'Grassland' | 'Savanna'

export interface FilterState {
  growth_forms: string[]
  water_use: string[]
  sun_exposure: string[]
  edible_only: boolean
  medicinal_only: boolean
  fire_adapted_only: boolean
  search_query: string
}
