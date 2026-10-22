const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'students.json');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
function readStudents() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeStudents(students) { fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2)); }
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''; req.on('data', chunk => { raw += chunk; if (raw.length > 1_000_000) reject(new Error('Request body too large')); });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/students' && req.method === 'GET') {
    try { const students = readStudents(); return sendJson(res, 200, { success: true, count: students.length, data: students }); }
    catch { return sendJson(res, 500, { success: false, message: 'Unable to retrieve students.' }); }
  }
  if (url.pathname === '/api/students' && req.method === 'POST') {
    let body;
    try { body = await readBody(req); }
    catch { return sendJson(res, 400, { success: false, message: 'Request body must contain valid JSON.' }); }
    const { name, email, course, year } = body || {};
    if (![name, email, course].every(value => typeof value === 'string' && value.trim()) || !Number.isInteger(Number(year)) || Number(year) < 1 || Number(year) > 6 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())) {
      return sendJson(res, 400, { success: false, message: 'Enter a name, valid email, course, and year from 1 to 6.' });
    }
    try {
      const students = readStudents();
      if (students.some(student => student.email.toLowerCase() === email.trim().toLowerCase())) return sendJson(res, 409, { success: false, message: 'A student with this email is already registered.' });
      const student = { id: students.reduce((max, item) => Math.max(max, item.id), 0) + 1, name: name.trim(), email: email.trim(), course: course.trim(), year: Number(year) };
      students.push(student); writeStudents(students);
      return sendJson(res, 201, { success: true, message: 'Student registered successfully.', data: student });
    } catch { return sendJson(res, 500, { success: false, message: 'Unable to save the student. Please try again.' }); }
  }
  if (url.pathname.startsWith('/api/')) return sendJson(res, 404, { success: false, message: 'API endpoint not found.' });
  if (req.method !== 'GET') { res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET' }); return res.end('Method Not Allowed'); }
  const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const file = path.resolve(ROOT, 'public', '.' + requested);
  if (!file.startsWith(path.resolve(ROOT, 'public') + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not Found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }); res.end(data);
  });
});
server.listen(PORT, () => console.log(`Student REST API running at http://localhost:${PORT}`));
