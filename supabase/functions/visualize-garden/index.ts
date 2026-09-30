// Supabase Edge Function — Replicate Stable Diffusion img2img
// Deploy: supabase functions deploy visualize-garden
// Secret: supabase secrets set REPLICATE_API_KEY=r8_your_key_here

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const REPLICATE_KEY = Deno.env.get('REPLICATE_API_KEY') ?? ''
const REPLICATE_API = 'https://api.replicate.com/v1'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { action, predictionId, prompt, imageUrl, strength } = await req.json()

    // ── Create prediction ──────────────────────────────────────────
    if (action === 'create') {
      const body: Record<string, unknown> = {
        // SDXL img2img — best quality for garden scenes
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: {
          prompt,
          negative_prompt: 'invasive plants, alien species, exotic garden, blurry, low quality, watermark, text, distorted, cartoon, ugly',
          num_outputs:          1,
          num_inference_steps:  30,
          guidance_scale:       7.5,
          scheduler:            'DPMSolverMultistep',
        },
      }

      // Add image if provided (img2img mode)
      if (imageUrl) {
        body.input = {
          ...(body.input as object),
          image:           imageUrl,
          prompt_strength: strength ?? 0.6,
        }
      }

      const res = await fetch(`${REPLICATE_API}/predictions`, {
        method: 'POST',
        headers: {
          Authorization:  `Token ${REPLICATE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail ?? `Replicate error ${res.status}`)
      }

      const data = await res.json()
      return new Response(JSON.stringify(data), {
        headers: { ...cors, 'Content-Type': 'application/json' },
        status: res.status,
      })
    }

    // ── Poll prediction ────────────────────────────────────────────
    if (action === 'poll') {
      const res = await fetch(`${REPLICATE_API}/predictions/${predictionId}`, {
        headers: { Authorization: `Token ${REPLICATE_KEY}` },
      })
      const data = await res.json()
      return new Response(JSON.stringify(data), {
        headers: { ...cors, 'Content-Type': 'application/json' },
        status: res.status,
      })
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (e: any) {
    console.error('Visualizer error:', e.message)
    return new Response(
      JSON.stringify({ error: e.message }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
