/**
 * Säkerställer att testanvändare alltid finns i fil-DB.
 * Körs vid serverstart – så läraren alltid kan logga in.
 * Sätter inte lösenord för befintliga användare, lägger bara till om de saknas.
 */

import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { readFileDB, writeFileDB, useFileDBOnly } from '../lib/db.js';

const TEST_PASSWORD = '1234';

// Testanvändare som MÅSTE finnas
const REQUIRED_PRO = {
  email: 'larare@test.se',
  name: 'Lärare',
  role: 'pro',
  classCode: 'C-JBPH',
  classCodes: ['C-JBPH'],
};

const REQUIRED_PARENT = {
  email: 'test',
  name: 'Test Förälder',
  role: 'parent',
};

const REQUIRED_CHILD = {
  email: 'otto@test.se',
  name: 'Otto',
  classCode: '1234',
  linkCode: '746450',
};

export async function ensureTestUsers() {
  if (!useFileDBOnly()) return;

  const db = readFileDB();
  let changed = false;
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);

  // Lärare
  const hasPro = (db.professionals || []).some((p) => p.email === REQUIRED_PRO.email);
  if (!hasPro) {
    db.professionals = db.professionals || [];
    db.professionals.push({
      id: randomUUID(),
      ...REQUIRED_PRO,
      passwordHash: hash,
    });
    changed = true;
    console.log('[DB] Seed: Lade till test-lärare (larare@test.se, lösenord 1234)');
  }

  // Förälder
  const hasParent = (db.parents || []).some((p) => p.email === REQUIRED_PARENT.email);
  if (!hasParent) {
    db.parents = db.parents || [];
    db.parents.push({
      id: randomUUID(),
      ...REQUIRED_PARENT,
      passwordHash: hash,
    });
    changed = true;
    console.log('[DB] Seed: Lade till test-förälder (test, lösenord 1234)');
  }

  // Barn
  const hasChild = (db.kids || []).some((k) => k.email === REQUIRED_CHILD.email);
  if (!hasChild) {
    db.kids = db.kids || [];
    db.kids.push({
      id: randomUUID(),
      ...REQUIRED_CHILD,
      passwordHash: hash,
    });
    changed = true;
    console.log('[DB] Seed: Lade till test-barn (otto@test.se, lösenord 1234)');
  }

  if (changed) {
    writeFileDB(db);
    console.log('[DB] Testanvändare säkerställda – lärare kan alltid logga in.');
  }
}
