import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Species, VegetationType } from '../types'

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
})

// ── GPS → native plants ───────────────────────────────────────────────────────
export async function getNativePlants(lat: number, lon: number): Promise<Species[]> {
  const { data, error } = await supabase.rpc('get_native_plants', {
    user_lat: lat,
    user_lon: lon,
  })
  if (error) throw error
  return (data ?? []) as Species[]
}

// ── Full species detail with companions ───────────────────────────────────────
export async function getSpeciesDetail(acceptedName: string): Promise<Species | null> {
  const { data, error } = await supabase
    .from('species')
    .select(`
      *,
      images:species_image(*),
      pollinators:species_pollinator(pollinator_type)
    `)
    .eq('accepted_name', acceptedName)
    .single()
  if (error) throw error
  return data as Species | null
}

// ── Vegetation type for GPS point ─────────────────────────────────────────────
export async function getVegetationType(lat: number, lon: number): Promise<VegetationType | null> {
  const { data, error } = await supabase
    .rpc('get_native_plants', { user_lat: lat, user_lon: lon })
  if (error) throw error
  if (!data || data.length === 0) return null
  const first = data[0]
  return {
    veg_type_code: first.veg_type_code,
    name:          first.vegetation_type,
    biome:         first.biome,
    bioregion:     '',
    threat_status: first.threat_status,
    province:      'Western Cape',
  }
}

// ── Search ────────────────────────────────────────────────────────────────────
export async function searchSpecies(query: string): Promise<Species[]> {
  const { data, error } = await supabase
    .from('species')
    .select('*')
    .or(`accepted_name.ilike.%${query}%,common_name_en.ilike.%${query}%,common_name_af.ilike.%${query}%,genus.ilike.%${query}%`)
    .limit(30)
  if (error) throw error
  return (data ?? []) as Species[]
}

// ── User garden designs ───────────────────────────────────────────────────────
export async function getUserDesigns(userId: string) {
  const { data, error } = await supabase
    .from('garden_designs')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function saveGardenDesign(design: {
  user_id: string
  name: string
  veg_type_code: string
  photo_url?: string
  species_placements: unknown[]
}) {
  const { data, error } = await supabase
    .from('garden_designs')
    .upsert(design)
    .select()
    .single()
  if (error) throw error
  return data
}
