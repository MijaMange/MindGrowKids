import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { connectDB, getDbInfo } from './lib/db.js';
import { useCookies } from './mw/auth.js';
import { auth } from './routes/auth.js';
import { checkins } from './routes/checkins.js';
import { classroom } from './routes/classroom.js';
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

app.use(bodyParser.json());
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

// Checkins routes (barn, checkins)
app.use('/api', checkins);

// Classroom routes (PIN, classes, analytics)
app.use('/api', classroom);

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

// Global error handler EFTER alla routes - fånga ohanterade fel
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER] Unhandled error:', err);
  console.error('[GLOBAL ERROR HANDLER] URL:', req.method, req.path);
  console.error('[GLOBAL ERROR HANDLER] Stack:', err?.stack);
  if (!res.headersSent) {
    res.status(500).json({ 
      error: 'internal_server_error', 
      message: err?.message || 'Ett oväntat fel uppstod',
      ...(process.env.NODE_ENV !== 'production' ? { 
        stack: err?.stack,
        path: req.path,
        method: req.method
      } : {})
    });
  } else {
    console.error('[GLOBAL ERROR HANDLER] Headers already sent, cannot send error response');
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
    await connectDB(process.env.MONGO_URL, process.env.MONGO_DB_NAME);

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`[API] Server started successfully on port ${port}`);
      const dbInfo = getDbInfo();
      console.log(`📊 Database: ${dbInfo.mode} (${dbInfo.dbName || 'N/A'})`);
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

