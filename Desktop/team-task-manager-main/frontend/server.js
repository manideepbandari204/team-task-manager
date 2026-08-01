const fs = require('fs');
const http = require('http');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const indexFile = path.join(buildDir, 'index.html');
const primaryPort = Number(process.env.PORT) || 3000;
const ports = [...new Set([primaryPort, 3000])];
const host = '0.0.0.0';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

function sendFile(req, res, filePath, statusCode = 200) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 500, 'Unable to read application file.');
      return;
    }

    const contentType = contentTypes[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(statusCode, {
      'Cache-Control': filePath === indexFile ? 'no-cache' : 'public, max-age=31536000, immutable',
      'Content-Type': contentType,
    });

    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

function resolveStaticPath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const requestedPath = decodedPath === '/' ? '/index.html' : decodedPath;
  const filePath = path.normalize(path.join(buildDir, requestedPath));

  if (!filePath.startsWith(buildDir)) {
    return null;
  }

  return filePath;
}

function handleRequest(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method not allowed.');
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    send(res, 200, 'OK');
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    send(res, 404, 'API requests must be sent to the backend service.');
    return;
  }

  const staticPath = resolveStaticPath(url.pathname);
  if (!staticPath) {
    send(res, 403, 'Forbidden.');
    return;
  }

  fs.stat(staticPath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(req, res, staticPath);
      return;
    }

    sendFile(req, res, indexFile);
  });
}

ports.forEach((port) => {
  const server = http.createServer(handleRequest);

  server.on('error', (error) => {
    if (port === primaryPort) {
      throw error;
    }

    console.warn(`Frontend could not bind optional port ${port}: ${error.message}`);
  });

  server.listen(port, host, () => {
    console.log(`Frontend listening on ${host}:${port}`);
  });
});
