#!/usr/bin/env node
/**
 * Lägger till USE_FILE_DB=1 i .env om det saknas.
 * Kör: node scripts/ensure-file-db.js
 * Då använder servern mock-db.json (Otto, Lärare, föräldrar) istället för MongoDB.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

const line = 'USE_FILE_DB=1';

if (!existsSync(envPath)) {
  writeFileSync(envPath, `# Genererat av scripts/ensure-file-db.js\nJWT_SECRET=byt_till_hemlig_nyckel_minst_16_tecken\n${line}\n`, 'utf8');
  console.log('Skapade .env med USE_FILE_DB=1. Sätt JWT_SECRET om du inte redan har det.');
  process.exit(0);
}

const content = readFileSync(envPath, 'utf8');
if (content.includes('USE_FILE_DB=1') || content.includes('USE_FILE_DB=true')) {
  console.log('.env innehåller redan USE_FILE_DB. Inget ändrat.');
  process.exit(0);
}

// Ta bort eventuell gammal USE_FILE_DB=0 eller annan variant
const lines = content.split('\n').filter((l) => !l.trim().startsWith('USE_FILE_DB='));
const newContent = lines.join('\n').trimEnd() + (lines.length ? '\n' : '') + '\n' + line + '\n';
writeFileSync(envPath, newContent, 'utf8');
console.log('Lade till USE_FILE_DB=1 i .env. Starta om servern (npm run dev).');
