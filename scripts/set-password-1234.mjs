#!/usr/bin/env node
/**
 * Sätter lösenord 1234 för alla användare som har passwordHash i server/mock-db.json.
 * Kör: node scripts/set-password-1234.mjs
 * Använder serverns bcryptjs (server/node_modules) så hashen blir identisk.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = join(__dirname, '..', 'server');
const dbPath = join(serverDir, 'mock-db.json');

// Använd samma bcryptjs som servern (server/node_modules)
const require = createRequire(join(serverDir, 'package.json'));
const bcrypt = require('bcryptjs');

const password = '1234';
const hash = await bcrypt.hash(password, 10);
const verify = await bcrypt.compare(password, hash);
if (!verify) {
  console.error('Fel: genererad hash verifierar inte mot 1234');
  process.exit(1);
}

const db = JSON.parse(readFileSync(dbPath, 'utf8'));

let count = 0;

if (db.parents) {
  db.parents.forEach((p) => {
    if (p.passwordHash) {
      p.passwordHash = hash;
      count++;
    }
  });
}
if (db.professionals) {
  db.professionals.forEach((p) => {
    if (p.passwordHash) {
      p.passwordHash = hash;
      count++;
    }
  });
}
if (db.kids) {
  db.kids.forEach((k) => {
    if (k.passwordHash) {
      k.passwordHash = hash;
      count++;
    }
  });
}

writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

// Verifiera: läs tillbaka och testa med serverns bcrypt
const db2 = JSON.parse(readFileSync(dbPath, 'utf8'));
const firstHash = db2.parents?.[0]?.passwordHash;
const verifyAgain = firstHash ? await bcrypt.compare('1234', firstHash) : false;
if (!verifyAgain) {
  console.error('VARNING: Hash verifierade inte efter skrivning. Kontrollera server/node_modules/bcryptjs.');
  process.exit(1);
}

console.log(`Uppdaterade lösenord till "1234" för ${count} användare i server/mock-db.json.`);
console.log('Otto, Lärare, Förälder (test, anna) m.fl. loggar in med lösenord: 1234');
