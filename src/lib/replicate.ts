// AI visualizer client — routes through Supabase Edge Function (Google Gemini free)
import { supabase } from './supabase'

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
const FUNCTION_URL      = `${SUPABASE_URL}/functions/v1/visualize-garden`

export function buildPrompt(
  speciesNames: string[],
  vegTypeName: string,
  biome: string
): string {
  const plants = speciesNames.slice(0, 4).join(', ')
  const style =
    biome === 'Fynbos'            ? 'Cape fynbos, South African native garden'
    : biome === 'Succulent Karoo' ? 'succulent Karoo, South African desert garden'
    : biome === 'Albany Thicket'  ? 'spekboom coastal thicket, South African garden'
    : biome === 'Nama-Karoo'      ? 'Nama-Karoo dry shrubland, South African garden'
    : 'South African indigenous garden'

  return `A beautiful photorealistic ${style} featuring ${plants} `
    + `growing naturally in a residential garden setting. `
    + `Professional garden photography, golden afternoon light, `
    + `lush indigenous plants, ${vegTypeName} vegetation type. `
    + `Highly detailed, 8K quality, natural lighting, no text, no people.`
}

export async function generateGardenImage(
  prompt: string,
  onStatus?: (msg: string) => void
): Promise<string> {
  onStatus?.('Generating your garden…')

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${SUPABASE_ANON_KEY}`,
      apikey:         SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Server error ${res.status}`)
  }

  const data = await res.json()
  if (data.error) throw new Error(data.error)
  if (!data.output?.[0]) throw new Error('No image generated')

  // Return data URI for base64, or raw URL
  if (data.isBase64) {
    return `data:${data.mimeType ?? 'image/png'};base64,${data.output[0]}`
  }
  return data.output[0]
}

export async function visualizeGarden(
  _photoUri: string,
  speciesNames: string[],
  vegTypeName: string,
  biome: string,
  _strength = 0.6,
  onStatus?: (msg: string) => void
): Promise<string> {
  onStatus?.('Building your garden prompt…')
  const prompt = buildPrompt(speciesNames, vegTypeName, biome)
  onStatus?.('AI is creating your native garden…')
  return generateGardenImage(prompt, onStatus)
}
