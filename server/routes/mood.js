import { Router } from 'express';
import mongoose from 'mongoose';
import { readFileDB, writeFileDB } from '../lib/db.js';
import { authRequired, roleRequired } from '../mw/auth.js';
import { Mood } from '../models/mood.js';

export const mood = Router();

const USE_MONGO = !!(mongoose.connection && mongoose.connection.readyState === 1);

const CLAMP = (n) => Math.max(0, Math.min(100, Math.round(n)));

function applyDecay(values, lastUpdatedISO) {
  // Liten daglig "glidning" mot 50 för balans
  const now = Date.now();
  const then = lastUpdatedISO ? Date.parse(lastUpdatedISO) : now;
  const days = Math.max(0, Math.floor((now - then) / 86400000));
  if (!days) return values;
  const keys = Object.keys(values);
  const out = { ...values };
  for (const k of keys) {
    const v = values[k];
    const toward = 50;
    // 3% per dag mot 50
    out[k] = CLAMP(v + (toward - v) * 0.03 * days);
  }
  return out;
}

async function getOrInit(childId) {
  if (USE_MONGO) {
    let doc = await Mood.findOne({ childRef: childId });
    if (!doc) doc = await Mood.create({ childRef: childId });
    const decayed = applyDecay(doc.values, doc.lastUpdated);
    if (JSON.stringify(decayed) !== JSON.stringify(doc.values)) {
      doc.values = decayed;
      doc.lastUpdated = new Date().toISOString();
      await doc.save();
    }
    return doc;
  }

  const db = readFileDB();
  db.moods = db.moods || [];
  let row = db.moods.find((m) => m.childRef === childId);
  if (!row) {
    row = {
      childRef: childId,
      values: { love: 50, joy: 50, calm: 50, energy: 50, sadness: 50, anger: 50 },
      lastUpdated: new Date().toISOString(),
    };
    db.moods.push(row);
    writeFileDB(db);
  }
  const decayed = applyDecay(row.values, row.lastUpdated);
  if (JSON.stringify(decayed) !== JSON.stringify(row.values)) {
    row.values = decayed;
    row.lastUpdated = new Date().toISOString();
    writeFileDB(db);
  }
  return row;
}

async function save(childId, values) {
  if (USE_MONGO) {
    await Mood.findOneAndUpdate(
      { childRef: childId },
      { $set: { values, lastUpdated: new Date().toISOString() } },
      { upsert: true }
    );
    return;
  }

  const db = readFileDB();
  db.moods = db.moods || [];
  const i = db.moods.findIndex((m) => m.childRef === childId);
  if (i > -1) {
    db.moods[i].values = values;
    db.moods[i].lastUpdated = new Date().toISOString();
  } else {
    db.moods.push({ childRef: childId, values, lastUpdated: new Date().toISOString() });
  }
  writeFileDB(db);
}

function applyDelta(values, delta) {
  const v = { ...values };
  for (const k of Object.keys(delta)) v[k] = CLAMP((v[k] || 50) + delta[k]);
  return v;
}

// GET /api/mood/me
mood.get('/mood/me', authRequired, roleRequired('child'), async (req, res) => {
  const doc = await getOrInit(req.user.id);
  res.json({ values: doc.values, lastUpdated: doc.lastUpdated });
});

// POST /api/mood/award  body: { reason, delta? }
mood.post('/mood/award', authRequired, roleRequired('child'), async (req, res) => {
  const { reason, delta } = req.body || {};
  const doc = await getOrInit(req.user.id);

  // standardregler (om delta ej skickas)
  let d = delta;
  if (!d) {
    if (reason === 'checkin_happy') d = { joy: +6, love: +2, sadness: -2, anger: -1 };
    else if (reason === 'checkin_calm') d = { calm: +6, energy: +1, anger: -1 };
    else if (reason === 'checkin_sad') d = { sadness: +6, love: +3, joy: +1 };
    else if (reason === 'checkin_angry') d = { anger: +6, calm: +2 };
    else if (reason === 'checkin_tired') d = { energy: -3, calm: +3 };
    else if (reason === 'checkin_curious') d = { joy: +3, energy: -1, calm: +1 };
    else if (reason === 'drew') d = { calm: +2, joy: +2 };
    else if (reason === 'listened') d = { love: +2, calm: +1 };
    else d = { joy: +1 };
  }

  const newVals = applyDelta(doc.values, d);
  await save(req.user.id, newVals);
  res.json({ ok: true, values: newVals });
});




