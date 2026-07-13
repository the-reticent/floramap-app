// Supabase Edge Function — Google Gemini image generation (free tier)
// 50 free requests/day, no credit card required
// Deploy: supabase functions deploy visualize-garden
// Secret: supabase secrets set GEMINI_API_KEY=your_key_here
//
// Get your free key at: aistudio.google.com/apikey

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { prompt } = await req.json()
    if (!prompt) throw new Error('prompt is required')

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          responseMimeType: 'text/plain',
        }
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = err.error?.message ?? `Gemini error ${res.status}`
      throw new Error(msg)
    }

    const data = await res.json()

    // Extract image from Gemini response
    let imageData: string | null = null
    let mimeType = 'image/png'

    for (const candidate of data.candidates ?? []) {
      for (const part of candidate.content?.parts ?? []) {
        if (part.inlineData?.data) {
          imageData = part.inlineData.data
          mimeType  = part.inlineData.mimeType ?? 'image/png'
          break
        }
      }
      if (imageData) break
    }

    if (!imageData) throw new Error('No image in Gemini response')

    return new Response(
      JSON.stringify({
        status:   'succeeded',
        output:   [imageData],
        mimeType,
        isBase64: true,
      }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (e: any) {
    console.error('Visualizer error:', e.message)
    return new Response(
      JSON.stringify({ error: e.message }),
      { headers: { ...cors, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
