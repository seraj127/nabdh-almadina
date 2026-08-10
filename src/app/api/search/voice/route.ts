import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = "force-dynamic";

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    let base64Audio: string | null = null;

    // Support both JSON body (base64) and FormData upload
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // FormData upload
      const formData = await request.formData()
      const audioFile = formData.get('audio') as File | null

      if (!audioFile) {
        return NextResponse.json(
          { error: 'No audio file provided. Please upload an audio file with the key "audio".' },
          { status: 400 }
        )
      }

      const arrayBuffer = await audioFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      base64Audio = buffer.toString('base64')
    } else {
      // JSON body with base64 audio
      const body = await request.json();
      const audio = body.audio;
      if (!audio) {
        return NextResponse.json(
          { error: 'No audio provided. Send JSON { audio: "base64..." } or FormData with "audio" file.' },
          { status: 400 }
        )
      }
      // If it's a data URL, strip the prefix
      base64Audio = audio.startsWith('data:') ? audio.split(',')[1] : audio;
    }

    if (!base64Audio) {
      return NextResponse.json(
        { error: 'Failed to extract audio data.' },
        { status: 400 }
      )
    }

    // Initialize the ZAI SDK and transcribe the audio
    const zai = await ZAI.create()
    const result = await zai.audio.asr.create({
      file_base64: base64Audio,
    })

    // Extract the transcribed text from the ASR result
    const text = typeof result === 'string'
      ? result
      : result?.text || result?.content || JSON.stringify(result)

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Voice search error:', error)
    const message = error instanceof Error ? error.message : 'Failed to transcribe audio'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
