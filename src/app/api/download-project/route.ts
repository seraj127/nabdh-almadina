import { NextRequest, NextResponse } from 'next/server';
import { statSync, existsSync, createReadStream, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Allowed download files (whitelist for security) ────
const ALLOWED_FILES: Record<string, { path: string; name: string; mime: string; descAr: string; descEn: string }> = {
  'source': {
    path: 'public/downloads/nabdh-almadina-source.tar.gz',
    name: 'nabdh-almadina-source.tar.gz',
    mime: 'application/gzip',
    descAr: 'الكود المصدري الكامل للمشروع',
    descEn: 'Complete project source code',
  },
  'full': {
    path: 'public/downloads/nabdh-almadina-full.tar.gz',
    name: 'nabdh-almadina-full.tar.gz',
    mime: 'application/gzip',
    descAr: 'المشروع الكامل مع node_modules وملفات البناء',
    descEn: 'Complete project with node_modules and build files',
  },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ─── GET: Download with resume support ──────────────────
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'source';

  // ─── Info endpoint ──────────────────────────────────
  if (searchParams.has('info')) {
    const fileInfo = ALLOWED_FILES[type];
    if (!fileInfo) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    const filePath = join(process.cwd(), fileInfo.path);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    const stat = statSync(filePath);
    return NextResponse.json({
      type,
      fileName: fileInfo.name,
      size: stat.size,
      sizeFormatted: formatBytes(stat.size),
      mime: fileInfo.mime,
      lastModified: stat.mtime.toISOString(),
      supportsResume: true,
      descAr: fileInfo.descAr,
      descEn: fileInfo.descEn,
    });
  }

  const fileInfo = ALLOWED_FILES[type];
  if (!fileInfo) {
    return NextResponse.json(
      { error: 'Invalid type. Available: source, full' },
      { status: 400 }
    );
  }

  const filePath = join(process.cwd(), fileInfo.path);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const stat = statSync(filePath);
  const fileSize = stat.size;
  const etag = `"${stat.size}-${stat.mtimeMs.toFixed(0)}"`;

  // ─── Common response headers ────────────────────────
  const commonHeaders: Record<string, string> = {
    'Content-Type': fileInfo.mime,
    'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.name)}"`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600',
    'ETag': etag,
    'Last-Modified': stat.mtime.toUTCString(),
    'X-Content-Type-Options': 'nosniff',
  };

  // ─── Check If-None-Match (cached) ──────────────────
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers: commonHeaders });
  }

  // ─── Range request (resume support) ────────────────
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

    const stream = createReadStream(filePath, { start, end, highWaterMark: 1024 * 1024 });

    const readable = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(chunk);
        });
        stream.on('end', () => {
          controller.close();
        });
        stream.on('error', (err) => {
          controller.error(err);
        });
      },
    });

    return new NextResponse(readable, {
      status: 206,
      headers: {
        ...commonHeaders,
        'Content-Length': String(chunkSize),
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      },
    });
  }

  // ─── Full download (streaming) ─────────────────────
  const stream = createReadStream(filePath, { highWaterMark: 1024 * 1024 });

  const readable = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk: Buffer) => {
        controller.enqueue(chunk);
      });
      stream.on('end', () => {
        controller.close();
      });
      stream.on('error', (err) => {
        controller.error(err);
      });
    },
  });

  return new NextResponse(readable, {
    status: 200,
    headers: {
      ...commonHeaders,
      'Content-Length': String(fileSize),
    },
  });
}

// ─── POST: Create/rebuild the archive on demand ────────
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'full';

  if (type !== 'full' && type !== 'source') {
    return NextResponse.json({ error: 'Invalid type. Available: source, full' }, { status: 400 });
  }

  try {
    const outputDir = join(process.cwd(), 'public', 'downloads');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = join(outputDir, `nabdh-almadina-${type}.tar.gz`);

    const excludes = [
      '.git', 'dev.log', 'server.log', '*.log', 'agent-ctx', '.claude',
      '.z-ai-config', 'upload', 'uploads', '.env', '*.apk', '*.tar.gz',
      'screenshot-*.png', 'public/_expo', 'public/mobile', 'public/assets',
    ];

    // For source type, also exclude node_modules and .next
    if (type === 'source') {
      excludes.push('node_modules', '.next');
    }

    const excludeFlags = excludes.map(e => `--exclude='${e}'`).join(' ');
    const tarCommand = [
      'tar',
      '-cf', `"${outputFile}"`,
      excludeFlags,
      `--transform='s,^,nabdh-almadina/,'`,
      "--use-compress-program='gzip -9'",
      '--totals',
      `-C "${process.cwd()}"`,
      '.',
    ].join(' ');

    execSync(tarCommand, {
      cwd: process.cwd(),
      maxBuffer: 50 * 1024 * 1024,
      stdio: 'pipe',
      timeout: 600000, // 10 minute timeout
    });

    const stat = statSync(outputFile);
    return NextResponse.json({
      success: true,
      type,
      fileName: `nabdh-almadina-${type}.tar.gz`,
      size: stat.size,
      sizeFormatted: formatBytes(stat.size),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Packaging failed: ${message}` }, { status: 500 });
  }
}

// ─── HEAD: Get file info without downloading ────────────
export async function HEAD(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'source';

  const fileInfo = ALLOWED_FILES[type];
  if (!fileInfo) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const filePath = join(process.cwd(), fileInfo.path);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const stat = statSync(filePath);
  const etag = `"${stat.size}-${stat.mtimeMs.toFixed(0)}"`;

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': fileInfo.mime,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.name)}"`,
      'Content-Length': String(stat.size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'ETag': etag,
      'Last-Modified': stat.mtime.toUTCString(),
    },
  });
}
