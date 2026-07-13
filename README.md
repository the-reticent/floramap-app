# FloraMap — Native Plant Landscape Visualizer

React Native (Expo) app. Cross-platform: iOS, Android, Web.

## Stack
- **Expo** (SDK 52, blank-typescript template)
- **Supabase** — Postgres + PostGIS backend, Auth, Storage
- **Zustand** — global state (persisted to AsyncStorage)
- **TanStack Query** — server state + caching
- **React Navigation** — bottom tabs + stack navigator
- **expo-location** — GPS for vegetation type lookup

## Project structure

```
src/
  components/
    ui/         Badge, SearchBar, BloomCalendar
    plant/      PlantCard
    visualizer/ (Phase 2)
  screens/
    DiscoverScreen       — GPS → native plants list
    SpeciesDetailScreen  — full species profile
    SavedScreen          — bookmarked species
    VisualizerScreen     — garden photo visualizer (Phase 2)
  navigation/   Bottom tab + stack setup
  hooks/
    useNativePlants      — location + Supabase RPC
    useFilteredPlants    — client-side filter logic
  lib/
    supabase.ts          — all Supabase queries
  store/
    index.ts             — Zustand store
  types/        TypeScript interfaces
  constants/    Colors, icons, theme
```

## Setup

```bash
# 1. Install deps
npm install

# 2. Add credentials
cp .env.template .env
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3. Run
npx expo start          # Expo Go (fastest)
npx expo run:ios        # Native iOS build
npx expo run:android    # Native Android build
npm run web             # Browser
```

## The core data flow

1. App starts → `useNativePlants` requests GPS permission
2. GPS coordinate → `supabase.rpc('get_native_plants', { lat, lon })`
3. PostGIS does `ST_Contains(vegmap_polygon, GPS_point)`  
4. Returns all native species for that exact SANBI vegetation type
5. Zustand stores result → DiscoverScreen renders PlantCard list
6. User taps plant → SpeciesDetailScreen with full profile

## Environment variables

| Variable | Description |
|----------|-------------|
| EXPO_PUBLIC_SUPABASE_URL | Your Supabase project URL |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | Your Supabase anon/public key |

## Phase 2 (Visualizer)

The VisualizerScreen is scaffolded. Phase 2 adds:
- `expo-camera` photo capture
- Image upload to Supabase Storage
- Replicate API call (Stable Diffusion inpainting) with selected species
- Composited photorealistic result returned and displayed
