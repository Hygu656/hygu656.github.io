const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mime = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
};

http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Nie znaleziono pliku');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`✅ KLIPEX działa na http://localhost:${PORT}`);
  console.log('   Naciśnij Ctrl+C żeby zatrzymać');
});
