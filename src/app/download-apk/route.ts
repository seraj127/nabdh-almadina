import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync, existsSync } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

export const dynamic = "force-dynamic";

const APK_PATH = join(process.cwd(), 'public', 'nabd-al-madina.apk');

export async function GET(request: NextRequest) {
  try {
    if (!existsSync(APK_PATH)) {
      return NextResponse.json({ error: 'APK not found' }, { status: 404 });
    }

    const stat = statSync(APK_PATH);
    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const matches = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
      if (!matches) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        });
      }

      const start = parseInt(matches[1], 10);
      const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const stream = createReadStream(APK_PATH, { start, end });
      const readable = Readable.toWeb(stream) as ReadableStream;

      return new NextResponse(readable, {
        status: 206,
        headers: {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': 'attachment; filename="nabd-al-madina.apk"',
          'Content-Length': chunkSize.toString(),
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
          'ETag': `"apk-${fileSize}"`,
        },
      });
    }

    // Full file - stream it
    const stream = createReadStream(APK_PATH);
    const readable = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(readable, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="nabd-al-madina.apk"',
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'ETag': `"apk-${fileSize}"`,
      },
    });
  } catch (error) {
    console.error('APK download error:', error);
    return NextResponse.json({ error: 'Failed to download APK' }, { status: 500 });
  }
}
