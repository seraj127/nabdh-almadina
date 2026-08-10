import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

const FILES_DIR = join(process.cwd(), 'public');

interface FileInfo {
  file: string;
  mime: string;
}

const FILES: Record<string, FileInfo> = {
  lite: { file: 'nabd-al-madina-mobile-lite.tar.gz', mime: 'application/gzip' },
  full: { file: 'nabd-al-madina-mobile.tar.gz', mime: 'application/gzip' },
  zip: { file: 'nabd-al-madina-app.zip', mime: 'application/zip' },
  apk: { file: 'nabd-al-madina.apk', mime: 'application/vnd.android.package-archive' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'lite';
    const fileInfo = FILES[type];

    if (!fileInfo) {
      return NextResponse.json({ error: 'Invalid type parameter. Use: lite, full, zip' }, { status: 400 });
    }

    const fileName = fileInfo.file;
    const filePath = join(FILES_DIR, fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found', fileName }, { status: 404 });
    }

    const fileStat = statSync(filePath);
    const fileSize = fileStat.size;

    // Handle range requests (resume support)
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const matches = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
      if (!matches) {
        return NextResponse.json({ error: 'Invalid range' }, { status: 416 });
      }

      const start = parseInt(matches[1], 10);
      const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      if (start >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        });
      }

      const stream = createReadStream(filePath, { start, end });
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      stream.on('data', async (chunk: Buffer) => {
        try {
          await writer.write(new Uint8Array(chunk));
        } catch {
          stream.destroy();
        }
      });

      stream.on('end', async () => {
        try { await writer.close(); } catch { /* Already closed */ }
      });

      stream.on('error', async (err) => {
        console.error('Stream error:', err.message);
        try { await writer.abort(err); } catch { /* Already closed */ }
      });

      return new NextResponse(readable, {
        status: 206,
        headers: {
          'Content-Type': fileInfo.mime,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': chunkSize.toString(),
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Full file download
    const stream = createReadStream(filePath);
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    stream.on('data', async (chunk: Buffer) => {
      try {
        await writer.write(new Uint8Array(chunk));
      } catch {
        stream.destroy();
      }
    });

    stream.on('end', async () => {
      try { await writer.close(); } catch { /* Already closed */ }
    });

    stream.on('error', async (err) => {
      console.error('Stream error:', err.message);
      try { await writer.abort(err); } catch { /* Already closed */ }
    });

    return new NextResponse(readable, {
      status: 200,
      headers: {
        'Content-Type': fileInfo.mime,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
