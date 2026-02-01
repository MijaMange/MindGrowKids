/**
 * Script för att direkt sätta in data i MongoDB
 * 
 * Användning:
 * node scripts/insert-direct.mjs
 * 
 * Eller kör via MongoDB Compass eller mongo shell med JSON-filerna
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../server/lib/db.js';
import { Kid, ParentUser, ProUser, Checkin, Mood, Avatar, ClassModel } from '../server/models/mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ladda .env
const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envPath of envPaths) {
  const loaded = dotenv.config({ path: envPath });
  if (!loaded.error) {
    console.log('[INSERT] Laddade .env från:', envPath);
    break;
  }
}

async function insertDirect() {
  await connectDB(process.env.MONGO_URL, process.env.MONGO_DB_NAME);

  console.log('[INSERT] Börjar sätta in data...\n');

  // 1. Skapa eller hitta klass
  let cls = await ClassModel.findOne({ code: '1234' });
  if (!cls) {
    cls = await ClassModel.create({
      code: '1234',
      name: 'Demoklass 1234',
      orgId: '',
    });
    console.log('[INSERT] ✅ Skapade klass:', cls.code);
  } else {
    console.log('[INSERT] ✅ Klass finns redan:', cls.code);
  }

  // 2. Skapa eller hitta lärare
  const proEmail = 'larare@test.se';
  const proPass = await bcrypt.hash('Hemligt123', 10);
  let pro = await ProUser.findOne({ email: proEmail });
  if (!pro) {
    pro = await ProUser.create({
      email: proEmail,
      passwordHash: proPass,
      name: 'Läraren Lisa',
      role: 'pro',
      classCode: '1234',
      orgId: '',
    });
    console.log('[INSERT] ✅ Skapade lärare:', pro.email);
  } else {
    console.log('[INSERT] ✅ Lärare finns redan:', pro.email);
  }

  // 3. Skapa eller hitta förälder
  const pEmail = 'parent@test.se';
  const pPass = await bcrypt.hash('Hemligt123', 10);
  let parent = await ParentUser.findOne({ email: pEmail });
  if (!parent) {
    parent = await ParentUser.create({
      email: pEmail,
      passwordHash: pPass,
      name: 'Mamma Test',
      role: 'parent',
    });
    console.log('[INSERT] ✅ Skapade förälder:', parent.email);
  } else {
    console.log('[INSERT] ✅ Förälder finns redan:', parent.email);
  }

  // 4. Skapa eller hitta barn
  let otto = await Kid.findOne({ name: 'Otto', classCode: '1234' });
  if (!otto) {
    otto = await Kid.create({
      name: 'Otto',
      classCode: '1234',
      orgId: '',
    });
    console.log('[INSERT] ✅ Skapade barn:', otto.name);
  } else {
    console.log('[INSERT] ✅ Barn finns redan:', otto.name);
  }

  // 5. Skapa checkins
  const existingCheckins = await Checkin.countDocuments({ studentId: otto._id.toString() });
  if (existingCheckins === 0) {
    const emotions = ['happy', 'calm', 'sad', 'curious', 'angry', 'tired'];
    const checkins = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(Date.now() - i * 864e5);
      checkins.push({
        orgId: '',
        classId: '',
        studentId: otto._id.toString(),
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        mode: i % 2 === 0 ? 'text' : 'draw',
        note: i % 2 === 0 ? `Checkin ${i + 1} - text` : '',
        drawingRef: i % 2 === 1 ? `data:image/png;base64,test${i}` : '',
        dateISO: date.toISOString(),
        createdAtISO: date.toISOString(),
      });
    }
    await Checkin.insertMany(checkins);
    console.log('[INSERT] ✅ Skapade', checkins.length, 'checkins för Otto');
  } else {
    console.log('[INSERT] ✅ Checkins finns redan:', existingCheckins, 'st');
  }

  // 6. Skapa mood
  let mood = await Mood.findOne({ childRef: otto._id });
  if (!mood) {
    mood = await Mood.create({
      childRef: otto._id,
      values: {
        love: 65,
        joy: 70,
        calm: 60,
        energy: 55,
        sadness: 30,
        anger: 25,
      },
      lastUpdated: new Date().toISOString(),
    });
    console.log('[INSERT] ✅ Skapade mood för Otto');
  } else {
    console.log('[INSERT] ✅ Mood finns redan för Otto');
  }

  // 7. Skapa avatar
  let avatar = await Avatar.findOne({ childRef: otto._id });
  if (!avatar) {
    avatar = await Avatar.create({
      childRef: otto._id,
      data: {
        hair: 'short',
        hairColor: '#8B4513',
        eyes: 'happy',
        mouth: 'smile',
        top: 'tshirt',
        topColor: '#FF6B6B',
        bottom: 'pants',
        bottomColor: '#4ECDC4',
        accessory: 'none',
        background: 'sky',
        skinTone: '#FDBCB4',
      },
    });
    console.log('[INSERT] ✅ Skapade avatar för Otto');
  } else {
    console.log('[INSERT] ✅ Avatar finns redan för Otto');
  }

  console.log('\n[INSERT] ✅ Klart! All data är nu i databasen.');
  console.log('\nTest-konton:');
  console.log('  Förälder: parent@test.se / Hemligt123');
  console.log('  Lärare: larare@test.se / Hemligt123 (klasskod: 1234)');
  console.log('  Barn: Otto / 1234');

  await mongoose.disconnect();
}

insertDirect().catch((e) => {
  console.error('[INSERT] Fel:', e);
  process.exit(1);
});




