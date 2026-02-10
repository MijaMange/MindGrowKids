import { Router } from 'express';
import mongoose from 'mongoose';
import { readFileDB, writeFileDB } from '../lib/db.js';
import { authRequired, roleRequired } from '../mw/auth.js';
import { Avatar } from '../models/avatar.js';

export const avatar = Router();

const USE_MONGO = !!(mongoose.connection && mongoose.connection.readyState === 1);

// Hämta nuvarande barns avatar
avatar.get('/avatar/me', authRequired, roleRequired('child'), async (req, res) => {
  if (USE_MONGO) {
    const doc = await Avatar.findOne({ childRef: req.user.id });
    return res.json(doc?.data || {});
  }

  const db = readFileDB();
  const row = (db.avatars || []).find((a) => a.childRef === req.user.id);
  if (row) return res.json(row.data || {});
  // Fallback: kolla om barnet finns i kids (äldre struktur med avatar på kid)
  const kid = (db.kids || []).find((k) => k.id === req.user.id);
  return res.json(kid?.avatar || {});
});

// Spara avatar för barnet
avatar.post('/avatar/me', authRequired, roleRequired('child'), async (req, res) => {
  const payload = req.body || {};

  if (USE_MONGO) {
    await Avatar.findOneAndUpdate(
      { childRef: req.user.id },
      { $set: { data: payload } },
      { upsert: true, new: true }
    );
    return res.json({ ok: true });
  }

  const db = readFileDB();
  db.avatars = db.avatars || [];
  const i = db.avatars.findIndex((a) => a.childRef === req.user.id);
  if (i > -1) {
    db.avatars[i].data = payload;
  } else {
    db.avatars.push({ childRef: req.user.id, data: payload });
  }
  if (payload.emoji != null) {
    const kid = (db.kids || []).find((k) => k.id === req.user.id);
    if (kid) {
      kid.emoji = typeof payload.emoji === 'string' ? payload.emoji : String(payload.emoji || '👤');
      const ki = db.kids.findIndex((k) => k.id === req.user.id);
      if (ki >= 0) db.kids[ki] = kid;
    }
  }
  writeFileDB(db);
  return res.json({ ok: true });
});




