import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { connectDB, getDbInfo, getFilePath } from './lib/db.js';
import { useCookies, authRequired, roleRequired } from './mw/auth.js';
import { auth } from './routes/auth.js';
import { avatar } from './routes/avatar.js';
import { checkins } from './routes/checkins.js';
import { classroom } from './routes/classroom.js';
import { listen } from './routes/listen.js';
import { children } from './routes/children.js';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];

let loadedFrom = null;
for (const p of candidates) {
  if (existsSync(p)) {
    const result = dotenv.config({ path: p });
    if (result.error) {
      console.warn(`[ENV] Kunde inte ladda .env från ${p}:`, result.error.message);
    } else {
      loadedFrom = p;
      console.log(`[ENV] Laddade ${Object.keys(result.parsed || {}).length} variabler från ${p}`);
      break;
    }
  }
}

console.log('[ENV] .env path:', loadedFrom || '(not found)');

// Varning om .env saknas
if (!loadedFrom) {
  console.error('');
  console.error('⚠️  ⚠️  ⚠️  WARNING: No .env file found! ⚠️  ⚠️  ⚠️');
  console.error('');
  console.error('The server looked for .env in:');
  candidates.forEach((p) => console.error(`  - ${p}`));
  console.error('');
  console.error('Without .env, the server will NOT be able to:');
  console.error('  ❌ Connect to MongoDB (MONGO_URL missing)');
  console.error('  ❌ Authenticate users (JWT_SECRET missing)');
  console.error('  ❌ Use OpenAI API (OPENAI_API_KEY missing)');
  console.error('');
  console.error('Please create a .env file in one of the locations above.');
  console.error('You can copy .env.example as a starting point:');
  console.error('  cp .env.example .env');
  console.error('');
}

const ok = (k) => {
  const val = process.env[k];
  const result = !!(val && String(val).trim().length);
  if (!result && k === 'JWT_SECRET') {
    console.error(`[ENV] ⚠️  ${k} saknas eller är tom. Värdet:`, val ? `"${val}" (${val.length} tecken)` : 'undefined');
  }
  return result;
};
console.log('[ENV] MONGO_URL:', ok('MONGO_URL') ? '✅' : '❌');
console.log('[ENV] MONGO_DB_NAME:', ok('MONGO_DB_NAME') ? '✅' : '❌');
console.log('[ENV] JWT_SECRET:', ok('JWT_SECRET') ? '✅' : '❌');
console.log('[ENV] OPENAI_API_KEY:', ok('OPENAI_API_KEY') ? '✅' : '❌');
console.log('[ENV] ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS || '(none)');
console.log('[ENV] PORT:', process.env.PORT || 4000);

// Debug: visa alla env-variabler som börjar med JWT
if (!ok('JWT_SECRET')) {
  console.log('[ENV] Debug - alla env-variabler som börjar med JWT:');
  Object.keys(process.env)
    .filter((k) => k.startsWith('JWT'))
    .forEach((k) => console.log(`[ENV]   ${k}:`, process.env[k] ? `"${process.env[k]}"` : 'undefined'));
}
const app = express();
app.set('trust proxy', 1);

const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Capacitor och PWA origins
const CAP_ALLOWED = [
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:5173',
  'https://mindgrowkids.online',
  'https://www.mindgrowkids.online'
];

// Ensure http://localhost:5173 is always in the allowed list
const FRONTEND_ORIGIN = 'http://localhost:5173';
const ORIGINS = Array.from(new Set([...allowed, ...CAP_ALLOWED, FRONTEND_ORIGIN]));

// I development, tillåt localhost automatiskt
const isDev = process.env.NODE_ENV !== 'production';

// Track if we've logged "no origin" to avoid spam
let hasLoggedNoOrigin = false;

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no Origin header (Postman, curl, etc.) - no logging to reduce spam
      if (!origin) {
        // Only log once per server start to avoid spam
        if (!hasLoggedNoOrigin && isDev) {
          console.log('[CORS] Requests without Origin header are allowed (Postman, curl, etc.)');
          hasLoggedNoOrigin = true;
        }
        return cb(null, true);
      }
      
      // In dev, allow localhost and capacitor origins
      if (isDev && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('capacitor://'))) {
        // Only log in dev mode, and only for new origins to reduce noise
        return cb(null, true);
      }
      
      // Check against allowed list
      if (ORIGINS.length === 0) {
        // Only log if in dev mode to reduce production noise
        if (isDev) {
          console.log('[CORS] No ORIGINS configured - allowing all');
        }
        return cb(null, true);
      }
      
      const isAllowed = ORIGINS.includes(origin);
      
      // Only log blocked requests or first-time allowed requests in dev mode
      if (isDev) {
        if (!isAllowed) {
          console.log('[CORS] ❌ Blocked:', origin, '(not in allowed list)');
          console.log('[CORS] Allowed origins:', ORIGINS.join(', '));
        }
        // Don't log every allowed request - too noisy
      }
      
      return cb(null, isAllowed);
    },
    credentials: true, // Required for cookies to work
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

console.log('[CORS] Allowed origins:', ORIGINS.length > 0 ? ORIGINS.join(', ') : 'all (no restrictions)');
console.log('[CORS] Credentials: enabled (cookies will work)');

// Öka limit så att teckningar (base64 PNG) kan skickas till /api/checkins
app.use(bodyParser.json({ limit: '5mb' }));
app.use(useCookies);

if (process.env.FORCE_HTTPS === 'true') {
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    if (proto !== 'https')
      return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
    next();
  });
}

// Definiera dist-mapp
const distPath = path.resolve(__dirname, '../dist');

// Health & diagnostics
app.get('/api/health', (req, res) => {
  try {
    res.json({ 
      ok: true, 
      env: process.env.NODE_ENV || 'dev',
      timestamp: new Date().toISOString(),
      origin: req.headers.origin || 'none',
      host: req.headers.host || 'unknown'
    });
  } catch (err) {
    console.error('[API/health] Error:', err);
    res.status(500).json({ error: 'health_check_failed', message: err?.message });
  }
});

app.get('/api/db-info', (req, res) => {
  try {
    res.json(getDbInfo());
  } catch (err) {
    console.error('[API/db-info] Error:', err);
    res.status(500).json({ error: 'db_info_failed', message: err?.message });
  }
});

// Auth routes (register, login, logout, me)
app.use('/api', auth);

// Avatar (barn, emoji-avatar)
app.use('/api', avatar);

// Checkins routes (barn, checkins)
app.use('/api', checkins);

// Classroom routes (PIN, classes, analytics)
app.use('/api', classroom);

// Listen routes (AI companion replies for children)
app.use('/api', listen);

// Children routes (age group, profile)
app.use('/api', children);

// Debug routes (endast i development)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/db', async (req, res) => {
    try {
      const { readFileDB } = await import('./lib/db.js');
      const db = readFileDB();
      const result = {
        parents: (db.parents || []).map((p) => ({
          id: p.id,
          email: p.email,
          name: p.name,
          childId: p.childId,
        })),
        kids: (db.kids || []).map((k) => ({
          id: k.id,
          name: k.name,
          classCode: k.classCode,
          linkCode: k.linkCode,
        })),
        pins: (db.pins || []).filter((p) => p.expiresAt > Date.now()),
        checkins: (db.checkins || []).slice(0, 10), // Bara första 10
      };
      res.setHeader('Content-Type', 'application/json');
      res.json(result);
    } catch (err) {
      console.error('[DEBUG/DB] Error:', err);
      res.status(500).json({ error: String(err), message: err instanceof Error ? err.message : 'Unknown error' });
    }
  });
}

// Dev seed endpoint (endast i development)
app.post('/api/dev/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    // Kör seed-scriptet
    const { runSeed } = await import('../scripts/seed.mjs');
    await runSeed();
    res.json({ ok: true, message: 'Seed data created successfully' });
  } catch (e) {
    console.error('[SEED] Error:', e);
    res.status(500).json({ ok: false, error: 'seed_failed', message: e.message });
  }
});

// Dev: lägg till en alternativ klass (ny klass med demo-elever) – listan växer
app.post('/api/dev/seed-class', authRequired, roleRequired('pro'), async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    const { readFileDB, writeFileDB } = await import('./lib/db.js');
    const { randomUUID } = await import('crypto');
    const db = readFileDB();

    db.professionals = db.professionals || [];
    let pro = db.professionals.find((p) => String(p.id) === String(req.user.id));
    if (!pro) {
      pro = {
        id: req.user.id,
        email: req.user.email || '',
        name: (req.user.name && String(req.user.name).trim()) || 'Lärare',
        role: 'pro',
        classCode: '',
        classCodes: [],
      };
      db.professionals.push(pro);
    }

    // Lista av klasskoder – behåll befintliga och lägg till en ny
    const existingCodes = pro.classCodes && Array.isArray(pro.classCodes) ? pro.classCodes : (pro.classCode ? [pro.classCode] : []);
    const newClassCode = 'C-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const classCodes = [...existingCodes, newClassCode];
    pro.classCodes = classCodes;
    pro.classCode = pro.classCode || newClassCode;

    const names = [
      'Ella', 'William', 'Alice', 'Oscar', 'Maja', 'Erik', 'Elsa', 'Leo', 'Olivia', 'Noah',
      'Astrid', 'Ludvig', 'Stella', 'Axel', 'Ebba', 'Viktor', 'Alma', 'Hugo', 'Wilma', 'Filip',
    ];
    const defaultEmojis = ['😊', '🌟', '🦋', '🐻', '🌸', '🌈', '🦊', '🐸', '🌻', '⭐', '🦉', '🐙', '🍀', '🎨', '🦄', '🐶', '🐱', '🐰', '🌺', '🍄'];
    const emotions = ['happy', 'calm', 'tired', 'sad', 'curious', 'angry'];
    db.kids = db.kids || [];
    db.checkins = db.checkins || [];
    db.classes = db.classes || [];

    const existingInClass = db.kids.filter((k) => k.classCode === newClassCode).map((k) => k.name);
    const toCreate = names.filter((n) => !existingInClass.includes(n));
    let created = 0;

    // Låtsas-data: något positivt snitt för pitch (mer happy/calm, några tired/sad)
    const emotionWeights = [0.28, 0.25, 0.15, 0.08, 0.14, 0.10]; // happy, calm, curious, tired, sad, angry
    const pickEmotion = () => {
      const r = Math.random();
      let s = 0;
      for (let j = 0; j < emotions.length; j++) {
        s += emotionWeights[j];
        if (r <= s) return emotions[j];
      }
      return emotions[0];
    };

    for (let i = 0; i < toCreate.length; i++) {
      const name = toCreate[i];
      const kid = {
        id: randomUUID(),
        name,
        classCode: newClassCode,
        linkCode: String(Math.floor(100000 + Math.random() * 900000)),
        emoji: defaultEmojis[i % defaultEmojis.length],
      };
      db.kids.push(kid);
      created++;

      // 14 dagar bakåt, 1–3 check-ins per dag per elev för färdig pitch-data
      for (let d = 0; d < 14; d++) {
        const dayStart = new Date(Date.now() - d * 864e5);
        const count = d === 0 ? 1 : (Math.random() > 0.4 ? 2 : 1);
        for (let c = 0; c < count; c++) {
          const offset = c * 3600 * (4 + Math.floor(Math.random() * 4)) * 1000;
          db.checkins.push({
            id: randomUUID(),
            studentId: kid.id,
            emotion: pickEmotion(),
            mode: 'text',
            note: '',
            drawingRef: '',
            dateISO: new Date(dayStart.getTime() + offset).toISOString(),
          });
        }
      }
    }

    const className = 'Demo klass ' + (classCodes.length);
    db.classes.push({
      id: randomUUID(),
      code: newClassCode,
      name: className,
      ownerUserId: pro.id,
    });

    const proIndex = db.professionals.findIndex((p) => String(p.id) === String(req.user.id));
    if (proIndex >= 0) db.professionals[proIndex] = pro;
    writeFileDB(db);

    const totalInClass = db.kids.filter((k) => k.classCode === newClassCode).length;
    console.log('[DEV/seed-class] Ny klass', newClassCode, ':', totalInClass, 'elever. Totalt', classCodes.length, 'klasser.');
    res.json({
      ok: true,
      classCode: newClassCode,
      classCodes,
      className,
      studentsCreated: created,
      totalInClass,
    });
  } catch (e) {
    console.error('[DEV/seed-class] Error:', e);
    res.status(500).json({ error: 'seed_class_failed', message: e?.message || 'Kunde inte skapa klass' });
  }
});

// Hjälp: ackumulerad sammanfattning per elev från checkins (inga detaljer)
function studentSummary(checkins) {
  if (!checkins || checkins.length === 0) return 'Ingen data ännu';
  const emotionCounts = {};
  checkins.forEach((c) => {
    const e = c.emotion || '';
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });
  const total = checkins.length;
  const happy = (emotionCounts.happy || 0) + (emotionCounts.calm || 0);
  const low = (emotionCounts.sad || 0) + (emotionCounts.tired || 0) + (emotionCounts.worried || 0) + (emotionCounts.afraid || 0) + (emotionCounts.angry || 0);
  if (happy / total >= 0.6) return 'Mår oftast bra';
  if (low / total >= 0.4) return 'Har haft några tunga dagar';
  return 'Varierande humör';
}

// GET /api/pro/my-classes (fil-DB) – lista alla klasser för läraren (emoji + sammanfattning per elev)
app.get('/api/pro/my-classes', authRequired, roleRequired('pro'), async (req, res) => {
  try {
    const { readFileDB } = await import('./lib/db.js');
    const db = readFileDB();
    const userId = req.user?.id != null ? String(req.user.id) : '';
    const pro = (db.professionals || []).find((p) => String(p.id) === userId);
    const codes = (pro?.classCodes && pro.classCodes.length) ? pro.classCodes : (pro?.classCode ? [pro.classCode] : []);

    const now = Date.now();
    const twoWeeksAgo = new Date(now - 14 * 864e5).toISOString();
    const checkins = (db.checkins || []).filter((c) => c && typeof c.dateISO === 'string' && c.dateISO >= twoWeeksAgo);

    function classMoodFromCheckins(classCheckins) {
      if (!classCheckins || classCheckins.length === 0) return { mood: 'ok', label: 'Okej', emoji: '😐' };
      const counts = {};
      classCheckins.forEach((c) => { const e = c.emotion || ''; counts[e] = (counts[e] || 0) + 1; });
      const total = classCheckins.length;
      const happy = (counts.happy || 0) + (counts.calm || 0);
      const low = (counts.sad || 0) + (counts.tired || 0) + (counts.worried || 0) + (counts.afraid || 0) + (counts.angry || 0);
      if (total > 0 && happy / total >= 0.5) return { mood: 'good', label: 'Bra', emoji: '😊' };
      if (total > 0 && low / total >= 0.35) return { mood: 'bad', label: 'Dåligt', emoji: '😟' };
      return { mood: 'ok', label: 'Okej', emoji: '😐' };
    }

    const classes = codes.map((code) => {
      try {
        const row = (db.classes || []).find((c) => c && c.code === code);
        const avatars = db.avatars || [];
        const codeNorm = (code || '').trim().toUpperCase();
        const classKids = (db.kids || []).filter((k) => k && (k.classCode || '').trim().toUpperCase() === codeNorm);
        const classCheckins = checkins.filter((c) => c && classKids.some((k) => k.id === c.studentId));
        const { mood: classMood, label: classMoodLabel, emoji: classMoodEmoji } = classMoodFromCheckins(classCheckins);
        const students = classKids.map((k) => {
          const emoji = k.emoji || (avatars.find((a) => a && a.childRef === k.id)?.data?.emoji) || '👤';
          const kidCheckins = checkins.filter((c) => c && c.studentId === k.id);
          const summary = studentSummary(kidCheckins);
          return { id: k.id, name: k.name, emoji, summary, gender: k.gender || null };
        });
        return { code, name: (row && row.name) || 'Klass ' + code, students, classMood, classMoodLabel, classMoodEmoji };
      } catch (inner) {
        console.error('[DEV/my-classes] Inner error for code', code, inner);
        return null;
      }
    }).filter((c) => c && c.code);

    return res.status(200).json({ classes });
  } catch (e) {
    console.error('[DEV/my-classes] Error:', e);
    return res.status(200).json({ classes: [] });
  }
});

// DELETE /api/classes/:code (pro) – radera en simulerad klass så listan inte växer obegränsat
app.delete('/api/classes/:code', authRequired, roleRequired('pro'), async (req, res) => {
  try {
    const { readFileDB, writeFileDB } = await import('./lib/db.js');
    const db = readFileDB();
    const code = req.params.code;
    const pro = db.professionals?.find((p) => String(p.id) === String(req.user.id));
    if (!pro) return res.status(404).json({ error: 'pro_not_found' });

    const classCodes = (pro.classCodes && pro.classCodes.length) ? pro.classCodes : (pro.classCode ? [pro.classCode] : []);
    if (!classCodes.includes(code)) return res.status(404).json({ error: 'class_not_found', message: 'Klassen hittades inte.' });

    const kidIds = (db.kids || []).filter((k) => k.classCode === code).map((k) => k.id);
    db.kids = (db.kids || []).filter((k) => k.classCode !== code);
    db.checkins = (db.checkins || []).filter((c) => !kidIds.includes(c.studentId));
    db.classes = (db.classes || []).filter((c) => c.code !== code);
    pro.classCodes = classCodes.filter((c) => c !== code);
    if (pro.classCode === code) pro.classCode = pro.classCodes[0] || '';
    const idx = db.professionals.findIndex((p) => String(p.id) === String(req.user.id));
    if (idx >= 0) db.professionals[idx] = pro;
    writeFileDB(db);

    console.log('[CLASSES] Deleted class', code);
    res.json({ ok: true, deleted: code });
  } catch (e) {
    console.error('[CLASSES] Delete error:', e);
    res.status(500).json({ error: 'delete_failed', message: e?.message || 'Kunde inte radera klassen' });
  }
});

// Serve static assets (JS, CSS, images, etc.) from dist
// Detta måste ligga EFTER API-routes men FÖRE SPA-fallback
if (existsSync(distPath)) {
  app.use(express.static(distPath));
}

// SPA fallback: serve index.html for all non-API routes
// Använd regex istället för "*" för Express v5-kompatibilitet
app.get(/^(?!\/api\/).*/, (req, res) => {
  // Only serve SPA fallback if dist folder exists (production build)
  if (!existsSync(distPath)) {
    return res.status(404).send('Frontend not built. Run: npm run build');
  }

  // Serve index.html for all other routes (SPA routing)
  const indexPath = path.join(distPath, 'index.html');
  if (!existsSync(indexPath)) {
    return res.status(404).send('index.html not found');
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[SPA Fallback] Error serving index.html:', err.message);
      res.status(500).send('Error loading application');
    }
  });
});

// Global error handler – för ProSimplePage-API:er returnera 200 med tom data så frontend inte kraschar
function safeEmptyForPath(p) {
  const path = (p || '').toLowerCase();
  if (path.includes('my-classes')) return { classes: [] };
  if (path.includes('my-class')) return { classCode: null, students: [] };
  if (path.includes('checkins')) return [];
  if (path.includes('analytics/weekly')) return { from: new Date(Date.now() - 7 * 864e5).toISOString(), to: new Date().toISOString(), buckets: {}, timeSeries: [], total: 0 };
  if (path.includes('analytics/summary')) return { summaryText: '', topEmotion: '', total: 0 };
  return null;
}

app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER] Unhandled error:', err?.message || err);
  console.error('[GLOBAL ERROR HANDLER] URL:', req.method, req.path);
  if (req.path) {
    const safe = safeEmptyForPath(req.path);
    if (safe !== null && !res.headersSent) {
      return res.status(200).json(safe);
    }
  }
  if (!res.headersSent) {
    res.status(500).json({
      error: 'internal_server_error',
      message: err?.message || 'Ett oväntat fel uppstod',
      ...(process.env.NODE_ENV !== 'production' ? { path: req.path, method: req.method } : {}),
    });
  } else {
    console.error('[GLOBAL ERROR HANDLER] Headers already sent');
  }
});

// Catch-all för routes som inte matchar
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'not_found', message: `API endpoint not found: ${req.method} ${req.path}` });
  } else {
    res.status(404).send('Not found');
  }
});

(async () => {
  try {
    // Använd alltid fil-DB (mock-db.json) om inte USE_MONGO=1 är satt – Otto, lärare, föräldrar finns i filen
    const useMongo = process.env.USE_MONGO === '1' || process.env.USE_MONGO === 'true';
    const mongoUrl = useMongo ? process.env.MONGO_URL : null;
    if (!useMongo) {
      console.log('[DB] Använder fil-DB (mock-db.json) – parent: test/anna, lärare: larare@test.se/lara, otto: otto@test.se – lösenord 1234');
    }
    await connectDB(mongoUrl, process.env.MONGO_DB_NAME);

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`[API] Server started successfully on port ${port}`);
      const dbInfo = getDbInfo();
      console.log(`📊 Database: ${dbInfo.mode} (${dbInfo.dbName || 'N/A'})`);
      if (dbInfo.mode === 'file') {
        console.log(`📁 Fil-DB: ${getFilePath()}`);
      }
      console.log(`🌐 CORS allowed origins: ${allowed.length > 0 ? allowed.join(', ') : 'all'}`);
      if (existsSync(distPath)) {
        console.log(`[STATIC] Serving static files from ${distPath}`);
      }
      console.log(`✅ Ready to accept requests`);
    });
  } catch (err) {
    console.error('[SERVER START] Fatal error:', err);
    console.error('[SERVER START] Stack:', err?.stack);
    process.exit(1);
  }
})();

