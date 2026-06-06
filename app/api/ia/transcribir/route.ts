import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as Blob | null
    if (!audio) return NextResponse.json({ error: 'audio required' }, { status: 400 })

    const file = new File([audio], 'audio.webm', { type: audio.type || 'audio/webm' })

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'es',
    })

    return NextResponse.json({ texto: transcription.text })
  } catch {
    return NextResponse.json({ error: 'Error transcribing audio' }, { status: 500 })
  }
}
