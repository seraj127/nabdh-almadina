import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    let base64Image: string | null = null;

    // Support both FormData upload and JSON base64 payload
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // FormData upload
      const formData = await request.formData()
      const imageFile = formData.get('image') as File | null

      if (!imageFile) {
        return NextResponse.json(
          { error: 'No image file provided. Please upload an image file with the key "image".' },
          { status: 400 }
        )
      }

      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      const mimeType = imageFile.type || 'image/jpeg'
      base64Image = `data:${mimeType};base64,${base64}`
    } else {
      // JSON body with base64 image
      const body = await request.json();
      const image = body.image;
      if (!image) {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }
      base64Image = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    }

    // Use VLM to analyze the image
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const response = await zai.chat.completions.createVision({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: base64Image!,
              },
            },
            {
              type: 'text',
              text: 'ما هو المنتج في هذه الصورة؟ أرجع كلمات البحث فقط بدون جمل إضافية. What product is in this image? Return only search keywords (2-4 words) without extra sentences. Examples: "wireless headphones", "red dress", "smart watch"',
            },
          ],
        },
      ],
    });

    const keywords = response.choices?.[0]?.message?.content?.trim() || 'product';

    return NextResponse.json({ query: keywords, keywords })
  } catch (error) {
    console.error('Image search error:', error)
    const message = error instanceof Error ? error.message : 'Failed to analyze image'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
