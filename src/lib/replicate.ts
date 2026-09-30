// AI visualizer — Replicate Stable Diffusion via Supabase Edge Function
import { supabase } from './supabase'

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
const FUNCTION_URL      = `${SUPABASE_URL}/functions/v1/visualize-garden`

// ── Upload photo to Supabase Storage ─────────────────────────────────────────
export async function uploadGardenPhoto(uri: string): Promise<string> {
  const filename = `gardens/${Date.now()}.jpg`
  const response = await fetch(uri)
  const blob     = await response.blob()
  const arrayBuf = await blob.arrayBuffer()

  const { error } = await supabase.storage
    .from('garden-photos')
    .upload(filename, new Uint8Array(arrayBuf), {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage
    .from('garden-photos')
    .getPublicUrl(filename)

  return data.publicUrl
}

// ── Build prompt ──────────────────────────────────────────────────────────────
export function buildPrompt(
  speciesNames: string[],
  vegTypeName: string,
  biome: string
): string {
  const plants = speciesNames.slice(0, 5).join(', ')
  const style =
    biome === 'Fynbos'            ? 'Cape fynbos, South African native garden'
    : biome === 'Succulent Karoo' ? 'succulent Karoo, South African desert garden'
    : biome === 'Albany Thicket'  ? 'spekboom coastal thicket, South African garden'
    : biome === 'Nama-Karoo'      ? 'Nama-Karoo dry shrubland garden'
    : 'South African indigenous garden'

  return `A beautiful photorealistic ${style} featuring ${plants} `
    + `growing naturally in a residential garden. `
    + `Professional garden photography, golden afternoon light, `
    + `lush indigenous plants, ${vegTypeName}. `
    + `Highly detailed, 8K quality, no text, no people.`
}

// ── Call edge function ────────────────────────────────────────────────────────
async function callEdge(body: Record<string, unknown>) {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${SUPABASE_ANON_KEY}`,
      apikey:         SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? err.detail ?? `Error ${res.status}`)
  }
  return res.json()
}

// ── Create + poll prediction ──────────────────────────────────────────────────
async function createPrediction(
  prompt: string,
  imageUrl?: string,
  strength = 0.6
) {
  return callEdge({ action: 'create', prompt, imageUrl, strength })
}

async function pollPrediction(
  id: string,
  onStatus?: (s: string) => void,
  timeoutMs = 120_000
): Promise<string> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const p = await callEdge({ action: 'poll', predictionId: id })
    onStatus?.(p.status)

    if (p.status === 'succeeded') {
      if (!p.output?.[0]) throw new Error('No output URL')
      return p.output[0]
    }
    if (p.status === 'failed' || p.status === 'canceled')
      throw new Error(p.error ?? 'Prediction failed')

    await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error('Timed out after 2 minutes')
}

// ── All-in-one ────────────────────────────────────────────────────────────────
export async function visualizeGarden(
  photoUri: string,
  speciesNames: string[],
  vegTypeName: string,
  biome: string,
  strength = 0.6,
  onStatus?: (msg: string) => void
): Promise<string> {
  onStatus?.('Building prompt…')
  const prompt = buildPrompt(speciesNames, vegTypeName, biome)

  // Upload photo if provided and not a placeholder
  let imageUrl: string | undefined
  if (photoUri && !photoUri.startsWith('data:')) {
    onStatus?.('Uploading photo…')
    try { imageUrl = await uploadGardenPhoto(photoUri) } catch { /* use text2img */ }
  }

  onStatus?.('Starting AI generation…')
  const prediction = await createPrediction(prompt, imageUrl, strength)

  const result = await pollPrediction(prediction.id, s => {
    onStatus?.(`AI is ${s}…`)
  })
  return result
}
