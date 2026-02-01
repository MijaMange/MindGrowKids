import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Prova flera möjliga platser för .env-filen
const envPaths = [
  path.resolve(__dirname, '../MindGrowKids/.env'), // MindGrowKids/MindGrowKids/.env
  path.resolve(__dirname, '../.env'), // Projektroten
];

let envLoaded = false;
for (const envPath of envPaths) {
  const loaded = dotenv.config({ path: envPath });
  if (!loaded.error) {
    console.log('[SEED] Laddade .env från:', envPath);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('[SEED] Varning: Ingen .env-fil hittades');
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../server/lib/db.js';
import { Kid, ParentUser, ProUser, Checkin, ClassModel } from '../server/models/mongo.js';

export async function runSeed() {
  await connectDB(process.env.MONGO_URL, process.env.MONGO_DB_NAME);

  // Klass 1234
  const cls = await ClassModel.findOneAndUpdate(
    { code: '1234' },
    { $setOnInsert: { code: '1234', name: 'Demoklass 1234' } },
    { upsert: true, new: true }
  );

  // Lärare
  const proEmail = 'larare@test.se';
  const proPass = await bcrypt.hash('Hemligt123', 10);
  await ProUser.findOneAndUpdate(
    { email: proEmail },
    {
      $setOnInsert: {
        email: proEmail,
        passwordHash: proPass,
        name: 'Läraren Lisa',
        role: 'pro',
        classCode: '1234',
      },
    },
    { upsert: true, new: true }
  );

  // Förälder
  const pEmail = 'parent@test.se';
  const pPass = await bcrypt.hash('Hemligt123', 10);
  await ParentUser.findOneAndUpdate(
    { email: pEmail },
    {
      $setOnInsert: {
        email: pEmail,
        passwordHash: pPass,
        name: 'Mamma Test',
        role: 'parent',
      },
    },
    { upsert: true, new: true }
  );

  // Barn: Otto / 1234 (med email/lösenord för unified login)
  const ottoEmail = 'otto@test.se';
  const ottoPass = await bcrypt.hash('Hemligt123', 10);
  // Uppdatera email och passwordHash även om Otto redan finns
  const otto = await Kid.findOneAndUpdate(
    { name: 'Otto', classCode: '1234' },
    {
      $set: {
        email: ottoEmail,
        passwordHash: ottoPass,
      },
      $setOnInsert: {
        name: 'Otto',
        classCode: '1234',
      },
    },
    { upsert: true, new: true }
  );

  // Några checkins
  const emos = ['happy', 'calm', 'sad', 'curious', 'angry', 'tired'];
  for (let i = 0; i < 4; i++) {
    await Checkin.create({
      orgId: '',
      classId: '',
      studentId: otto._id.toString(),
      emotion: emos[(Math.random() * emos.length) | 0],
      mode: 'text',
      note: 'seed',
      drawingRef: '',
      dateISO: new Date(Date.now() - i * 864e5).toISOString(),
    });
  }

  console.log('[SEED] ✅ Testdata skapad:');
  console.log('[SEED]   - Förälder: parent@test.se / Hemligt123');
  console.log('[SEED]   - Lärare: larare@test.se / Hemligt123 (klasskod: 1234)');
  console.log('[SEED]   - Barn: otto@test.se / Hemligt123 (klasskod: 1234)');
  console.log('[SEED]   - Klass: 1234 (Demoklass 1234)');
  console.log('[SEED]   - Checkins: 4 st för Otto');
}

// Om scriptet körs direkt (inte importerat)
// Kontrollera om vi körs som huvudscript
const isMainModule = import.meta.url === `file://${path.resolve(process.argv[1])}` || 
                      process.argv[1]?.includes('seed.mjs') ||
                      process.argv[1]?.endsWith('seed.mjs');

if (isMainModule) {
  runSeed()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

