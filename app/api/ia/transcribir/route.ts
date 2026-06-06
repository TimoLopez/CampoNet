import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as Blob | null
    if (!audio) return Response.json({ error: 'audio required' }, { status: 400 })
    if (audio.size > 25 * 1024 * 1024) {
      return Response.json({ error: 'Audio too large (max 25 MB)' }, { status: 413 })
    }

    const file = new File([audio], 'audio.webm', { type: audio.type || 'audio/webm' })

    const transcription = await openai.audio.transcriptions.create(
      { file, model: 'whisper-1', language: 'es' },
      { timeout: 20000 }
    )

    return Response.json({ texto: transcription.text })
  } catch (err) {
    console.error('[transcribir]', err)
    return Response.json({ error: 'Error transcribing audio' }, { status: 500 })
  }
}
