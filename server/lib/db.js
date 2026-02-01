import mongoose from 'mongoose';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PATH = join(__dirname, '../mock-db.json');

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

// File helpers
export function readFileDB() {
  return JSON.parse(readFileSync(PATH, 'utf8'));
}

export function writeFileDB(d) {
  writeFileSync(PATH, JSON.stringify(d, null, 2));
}

