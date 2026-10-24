const http = require('http');
const fs = require('fs');
const path = require('path');

// Chỉ mở server ở máy này (không cho máy khác trong LAN truy cập).
// Muốn mở ra LAN: set biến môi trường HOST=0.0.0.0
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;

// Thư mục chứa bài hát tự ghi âm (tự quét, không cần khai báo tên file)
const SONGS_DIR = path.join(ROOT, 'assets', 'bai hat ca nhan');
const AUDIO_EXT = new Set(['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac']);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendText(res, status, text, extraHeaders) {
  if (res.headersSent) return;
  res.writeHead(status, Object.assign({
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text)
  }, extraHeaders || {}));
  res.end(text);
}

/**
 * Liệt kê các file nhạc trong "assets/bai hat ca nhan".
 * Tên bài lấy từ tên file: bai_hat_1.mp3 -> "bai hat 1"
 */
function listSongs() {
  let entries;
  try {
    entries = fs.readdirSync(SONGS_DIR, { withFileTypes: true });
  } catch (err) {
    return [];
  }

  return entries
    .filter((entry) => entry.isFile() && AUDIO_EXT.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const title = entry.name
        .replace(/\.[^.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .trim();
      return {
        title: title || entry.name,
        file: entry.name,
        url: 'assets/bai hat ca nhan/' + encodeURIComponent(entry.name)
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'vi'));
}

/**
 * Chuyển URL thành đường dẫn file an toàn bên trong ROOT.
 * Trả về null nếu URL hỏng hoặc cố tình trỏ ra ngoài thư mục web.
 */
function resolveSafePath(rawUrl) {
  let pathname;
  try {
    // URL hỏng (vd: /%E0%A4%A) sẽ ném URIError -> trả null thay vì crash server
    pathname = decodeURIComponent(rawUrl.split('?')[0]);
  } catch (err) {
    return null;
  }

  if (pathname.includes('\0')) return null;
  if (pathname === '/' || pathname === '') pathname = '/index.html';

  // '.' + pathname để đường dẫn luôn là tương đối, rồi resolve về tuyệt đối
  const filePath = path.resolve(ROOT, '.' + pathname);

  // Chặn path traversal: phải nằm trong ROOT (không lọt ra Desktop hay ổ C)
  const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (!filePath.startsWith(rootPrefix)) return null;

  // Chặn mọi file/thư mục ẩn: .git, .env, .vscode, ...
  const segments = path.relative(ROOT, filePath).split(path.sep);
  if (segments.some((seg) => seg.startsWith('.'))) return null;

  return filePath;
}

/**
 * Đọc header Range: bytes=start-end | bytes=start- | bytes=-suffix
 * Trả về {start, end} hoặc 'invalid'.
 */
function parseRange(rangeHeader, fileSize) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return 'invalid';

  const [, rawStart, rawEnd] = match;
  if (rawStart === '' && rawEnd === '') return 'invalid';

  let start;
  let end;

  if (rawStart === '') {
    // bytes=-500 : 500 byte cuối file
    const suffixLength = parseInt(rawEnd, 10);
    if (suffixLength === 0) return 'invalid';
    start = Math.max(0, fileSize - suffixLength);
    end = fileSize - 1;
  } else {
    start = parseInt(rawStart, 10);
    end = rawEnd === '' ? fileSize - 1 : parseInt(rawEnd, 10);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'invalid';
  if (start > end || start >= fileSize) return 'invalid';

  return { start, end: Math.min(end, fileSize - 1) };
}

function serveFile(req, res, filePath) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (err) {
    sendText(res, 404, '404 Not Found');
    return;
  }

  if (!stat.isFile()) {
    sendText(res, 403, '403 Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const fileSize = stat.size;
  const rangeHeader = req.headers.range;

  // HEAD: trả header, không trả body
  if (req.method === 'HEAD') {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });
    res.end();
    return;
  }

  if (rangeHeader) {
    const range = parseRange(rangeHeader, fileSize);
    if (range === 'invalid') {
      sendText(res, 416, '416 Range Not Satisfiable', {
        'Content-Range': `bytes */${fileSize}`
      });
      return;
    }

    const { start, end } = range;
    const stream = fs.createReadStream(filePath, { start, end });
    stream.on('error', () => {
      if (!res.headersSent) sendText(res, 500, '500 Internal Server Error');
      else res.destroy();
    });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': contentType
    });
    stream.pipe(res);
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) sendText(res, 500, '500 Internal Server Error');
    else res.destroy();
  });
  res.writeHead(200, {
    'Content-Length': fileSize,
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes'
  });
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendText(res, 405, '405 Method Not Allowed', { Allow: 'GET, HEAD' });
      return;
    }

    // API tự quét danh sách bài hát cá nhân
    if ((req.url || '').split('?')[0] === '/api/songs') {
      const body = JSON.stringify({ songs: listSongs() });
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store'
      });
      res.end(req.method === 'HEAD' ? undefined : body);
      return;
    }

    const filePath = resolveSafePath(req.url || '/');
    if (!filePath) {
      sendText(res, 404, '404 Not Found');
      return;
    }

    serveFile(req, res, filePath);
  } catch (err) {
    // Bất kỳ lỗi bất ngờ nào cũng không được làm sập server
    console.error('Lỗi khi xử lý request:', err);
    sendText(res, 500, '500 Internal Server Error');
  }
});

// Request bị client ngắt giữa chừng: bỏ qua, không crash
server.on('clientError', (err, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
