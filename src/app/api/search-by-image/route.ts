import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-static";

// Search by image using VLM (Vision Language Model) to describe the image
// and then extract a search query from it
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Use VLM to analyze the image and generate a search query
    const { createVLM } = await import('z-ai-web-dev-sdk');
    const vlm = createVLM();

    const response = await vlm.chat({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
              },
            },
            {
              type: 'text',
              text: 'Look at this image and identify the main product. Respond with ONLY a short search query (2-4 words) that would find this product in an e-commerce store. If the image shows electronics, mention the type. If clothing, mention the type. Respond in English only. Examples: "wireless headphones", "red dress", "smart watch", "running shoes", "perfume bottle"',
            },
          ],
        },
      ],
      max_tokens: 50,
    });

    const query = response.choices?.[0]?.message?.content?.trim() || 'product';

    return NextResponse.json({ query });
  } catch (error) {
    console.error('Image search error:', error);
    // Return a generic fallback query
    return NextResponse.json({ query: 'similar product' });
  }
}
