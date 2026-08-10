import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createReadStream, statSync, existsSync } from 'fs';
import { join } from 'path';

const PORT = 3031;
const FILES_DIR = '/home/z/my-project/public';

interface FileEntry {
  file: string;
  mime: string;
}

const FILES: Record<string, FileEntry> = {
  lite: { file: 'nabd-al-madina-mobile-lite.tar.gz', mime: 'application/gzip' },
  full: { file: 'nabd-al-madina-mobile.tar.gz', mime: 'application/gzip' },
  zip: { file: 'nabd-al-madina-app.zip', mime: 'application/zip' },
  source: { file: 'city-pulse-source.tar.gz', mime: 'application/gzip' },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function handleRequest(req: IncomingMessage, res: ServerResponse) {
  // CORS - critical for cross-origin resume support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, If-Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges, Content-Disposition, ETag');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', supportsResume: true }));
    return;
  }

  // Info endpoint
  if (pathname === '/info') {
    const type = url.searchParams.get('type') || 'lite';
    const fileInfo = FILES[type];
    if (!fileInfo) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid type. Use: lite, full, zip' }));
      return;
    }
    const filePath = join(FILES_DIR, fileInfo.file);
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not found' }));
      return;
    }
    const stat = statSync(filePath);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      type,
      fileName: fileInfo.file,
      size: stat.size,
      sizeFormatted: formatBytes(stat.size),
      mime: fileInfo.mime,
      lastModified: stat.mtime.toISOString(),
      etag: `"${stat.size}-${stat.mtimeMs.toFixed(0)}"`,
      supportsResume: true,
    }));
    return;
  }

  // List files
  if (pathname === '/list') {
    const list = Object.entries(FILES).map(([type, info]) => {
      const filePath = join(FILES_DIR, info.file);
      const exists = existsSync(filePath);
      const size = exists ? statSync(filePath).size : 0;
      return { type, fileName: info.file, mime: info.mime, size, sizeFormatted: formatBytes(size), exists };
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ files: list, supportsResume: true }));
    return;
  }

  // Download endpoint
  const type = url.searchParams.get('type') || 'lite';
  const fileInfo = FILES[type];

  if (!fileInfo) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid type. Use: lite, full, zip' }));
    return;
  }

  const filePath = join(FILES_DIR, fileInfo.file);

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'File not found', fileName: fileInfo.file }));
    return;
  }

  const stat = statSync(filePath);
  const fileSize = stat.size;
  const contentType = fileInfo.mime;
  const etag = `"${stat.size}-${stat.mtimeMs.toFixed(0)}"`;

  // HEAD request
  if (req.method === 'HEAD') {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.file)}"`,
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'ETag': etag,
      'Last-Modified': stat.mtime.toUTCString(),
    });
    res.end();
    return;
  }

  // Range request (resume support)
  const rangeHeader = req.headers.range;

  if (rangeHeader) {
    const matches = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
    if (!matches) {
      res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
      res.end();
      return;
    }

    const start = parseInt(matches[1], 10);
    const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
      res.end();
      return;
    }

    const chunkSize = end - start + 1;

    console.log(`📂 Resume: ${fileInfo.file} bytes=${start}-${end}/${fileSize} (${formatBytes(chunkSize)})`);

    res.writeHead(206, {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.file)}"`,
      'Content-Length': chunkSize,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'ETag': etag,
      'Last-Modified': stat.mtime.toUTCString(),
    });

    const stream = createReadStream(filePath, { start, end, highWaterMark: 1024 * 1024 });
    stream.on('error', () => { if (!res.writableEnded) res.end(); });
    stream.pipe(res);
    return;
  }

  // Full download
  console.log(`📥 Download: ${fileInfo.file} (${formatBytes(fileSize)})`);

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.file)}"`,
    'Content-Length': fileSize,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600',
    'ETag': etag,
    'Last-Modified': stat.mtime.toUTCString(),
  });

  const stream = createReadStream(filePath, { highWaterMark: 1024 * 1024 });
  stream.on('error', () => { if (!res.writableEnded) res.end(); });
  stream.pipe(res);
}

const server = createServer(handleRequest);
server.timeout = 600000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.listen(PORT, () => {
  console.log(`\n📦 Download Service — Resume Supported — Port ${PORT}\n`);
  Object.entries(FILES).forEach(([type, info]) => {
    const filePath = join(FILES_DIR, info.file);
    if (existsSync(filePath)) {
      console.log(`  ✅ ${type}: ${info.file} (${formatBytes(statSync(filePath).size)})`);
    } else {
      console.log(`  ❌ ${type}: ${info.file} (not found)`);
    }
  });
  console.log('');
});
