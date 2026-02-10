import mongoose from 'mongoose';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PATH = join(__dirname, '../mock-db.json');

export function getFilePath() {
  return PATH;
}

const DEFAULT = {
  users: [],
  parents: [],
  professionals: [],
  kids: [],
  checkins: [],
  moods: [],
  avatars: [],
  classes: [],
  pins: [],
};

if (!existsSync(PATH)) {
  writeFileSync(PATH, JSON.stringify(DEFAULT, null, 2));
}

let CURRENT = { mode: 'file', dbName: null, host: null };

export async function connectDB(url, dbName) {
  if (!url) {
    console.log('[DB] Ingen MONGO_URL → fil-fallback');
    CURRENT = { mode: 'file', dbName: 'mock-file', host: 'local' };
    return CURRENT;
  }

  if (!dbName) {
    console.warn('[DB] VARNING: inget MONGO_DB_NAME angivet – ange "MindGrow" i .env');
  }

  try {
    const options = dbName ? { dbName, serverSelectionTimeoutMS: 8000 } : { serverSelectionTimeoutMS: 8000 };
    await mongoose.connect(url, options);
    const connectedDbName = mongoose.connection.name;
    const connectedHost = mongoose.connection.host;
    console.log(`[DB] MongoDB ansluten → ${connectedDbName} @ ${connectedHost}`);
    CURRENT = { mode: 'mongo', dbName: connectedDbName, host: connectedHost };
    return CURRENT;
  } catch (e) {
    console.warn('[DB] Mongo misslyckades → fil-fallback:', e?.message);
    CURRENT = { mode: 'file', dbName: 'mock-file', host: 'local' };
    return CURRENT;
  }
}

export function getDbInfo() {
  return CURRENT;
}

/** True om appen använder endast fil-DB (ingen MongoDB). */
export function useFileDBOnly() {
  return getDbInfo().mode === 'file';
}

// File helpers – return DEFAULT vid parse-fel så att API inte kraschar med 500
export function readFileDB() {
  try {
    const raw = JSON.parse(readFileSync(PATH, 'utf8'));
    return {
      users: raw.users ?? raw.children ?? DEFAULT.users,
      parents: raw.parents ?? DEFAULT.parents,
      professionals: raw.professionals ?? DEFAULT.professionals,
      kids: raw.kids ?? DEFAULT.kids,
      checkins: raw.checkins ?? DEFAULT.checkins,
      moods: raw.moods ?? DEFAULT.moods,
      avatars: raw.avatars ?? DEFAULT.avatars,
      classes: raw.classes ?? DEFAULT.classes,
      pins: raw.pins ?? DEFAULT.pins,
    };
  } catch (e) {
    console.error('[DB] readFileDB error:', e?.message);
    return { ...DEFAULT };
  }
}

export function writeFileDB(d) {
  writeFileSync(PATH, JSON.stringify(d, null, 2));
}

