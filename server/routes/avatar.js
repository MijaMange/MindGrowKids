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
    let doc = await Avatar.findOne({ childRef: req.user.id });
    return res.json(doc?.data || {});
  }

  const db = readFileDB();
  const child = db.children.find((c) => c.id === req.user.id);
  return res.json(child?.avatar || {});
});

// Spara avatar för barnet
avatar.post('/avatar/me', authRequired, roleRequired('child'), async (req, res) => {
  const payload = req.body || {};

  if (USE_MONGO) {
    const doc = await Avatar.findOneAndUpdate(
      { childRef: req.user.id },
      { $set: { data: payload } },
      { upsert: true, new: true }
    );
    return res.json({ ok: true });
  }

  const db = readFileDB();
  const i = db.children.findIndex((c) => c.id === req.user.id);
  if (i > -1) {
    db.children[i].avatar = payload;
    writeFileDB(db);
    return res.json({ ok: true });
  }
  res.status(404).json({ error: 'child_not_found' });
});




