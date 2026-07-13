// Fetch plant images from iNaturalist — free, no API key, excellent Cape flora coverage
// Falls back to GBIF media API if iNaturalist has no results

const INATURALIST_API = 'https://api.inaturalist.org/v1'
const GBIF_API = 'https://api.gbif.org/v1'

export interface PlantImage {
  url: string
  thumb_url: string
  attribution: string
  license: string
  photographer: string
}

export async function fetchSpeciesImages(
  acceptedName: string,
  gbifTaxonKey?: string,
  limit = 6
): Promise<PlantImage[]> {
  try {
    // Try iNaturalist first — best photo quality for SA plants
    const inatRes = await fetch(
      `${INATURALIST_API}/observations?taxon_name=${encodeURIComponent(acceptedName)}&quality_grade=research&has_photos=true&per_page=${limit}&order_by=votes&place_id=113055`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (inatRes.ok) {
      const data = await inatRes.json()
      const photos: PlantImage[] = []
      for (const obs of data.results ?? []) {
        for (const photo of obs.photos ?? []) {
          if (photo.url) {
            photos.push({
              url:          photo.url.replace('/square', '/large'),
              thumb_url:    photo.url.replace('/square', '/medium'),
              attribution:  photo.attribution ?? '',
              license:      photo.license_code ?? 'unknown',
              photographer: photo.attribution?.match(/\(c\) ([^,]+)/)?.[1] ?? 'iNaturalist',
            })
          }
          if (photos.length >= limit) break
        }
        if (photos.length >= limit) break
      }
      if (photos.length > 0) return photos
    }
  } catch {
    // Fall through to GBIF
  }

  // GBIF fallback — uses taxon key directly
  if (gbifTaxonKey) {
    try {
      const gbifRes = await fetch(
        `${GBIF_API}/species/${gbifTaxonKey}/media?limit=${limit}&type=StillImage`,
        { signal: AbortSignal.timeout(6000) }
      )
      if (gbifRes.ok) {
        const data = await gbifRes.json()
        return (data.results ?? [])
          .filter((m: any) => m.identifier)
          .map((m: any) => ({
            url:          m.identifier,
            thumb_url:    m.identifier,
            attribution:  m.rightsHolder ?? m.creator ?? '',
            license:      m.license ?? 'unknown',
            photographer: m.creator ?? 'GBIF',
          }))
      }
    } catch {
      // No images available
    }
  }

  return []
}

// iNaturalist place IDs for South Africa region
// 113055 = South Africa
// We use this to bias towards local Cape flora photos
