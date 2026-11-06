// server.js - Lightweight backend for Buku Kas Bakso Josjis
// Zero external npm dependencies (pure Node.js http, fs, path)
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DIST_DIR = path.join(__dirname, 'dist');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB template
const getInitialDB = () => ({
  sales: [],
  expenses: [],
  batches: [],
  settings: {},
  last_updated: new Date().toISOString()
});

// Helper to read DB
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading DB file, returning fallback:', err);
    return getInitialDB();
  }
};

// Helper to write DB safely
const writeDB = (data) => {
  try {
    const payload = {
      sales: Array.isArray(data.sales) ? data.sales : [],
      expenses: Array.isArray(data.expenses) ? data.expenses : [],
      batches: Array.isArray(data.batches) ? data.batches : [],
      settings: data.settings || {},
      last_updated: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB file:', err);
    return false;
  }
};

// MIME types for static server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // --- API ROUTES ---

  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'Bakso Josjis Backend', time: new Date() }));
    return;
  }

  // Get full database
  if (pathname === '/api/data' && req.method === 'GET') {
    const db = readDB();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: db }));
    return;
  }

  // Save/Sync full database
  if (pathname === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Safety limit: 20MB
      if (body.length > 20 * 1024 * 1024) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const success = writeDB(payload);
        if (success) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Data berhasil disimpan di server!', 
            updated_at: new Date().toISOString() 
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Gagal menulis ke database file di server.' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload.' }));
      }
    });
    return;
  }

  // Download DB backup
  if (pathname === '/api/backup' && req.method === 'GET') {
    const db = readDB();
    const dateStr = new Date().toISOString().split('T')[0];
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="backup_bakso_josjis_${dateStr}.json"`
    });
    res.end(JSON.stringify(db, null, 2));
    return;
  }

  // --- STATIC FILE SERVING (Fallback if dist exists) ---
  if (fs.existsSync(DIST_DIR)) {
    let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
    
    // SPA Fallback: If file doesn't exist, serve index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const fileData = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fileData);
      return;
    } catch (e) {
      // Fall through to 404
    }
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🍜 Bakso Josjis Server berjalan di http://0.0.0.0:${PORT}`);
  console.log(`📁 Database disimpan di: ${DB_FILE}`);
});
