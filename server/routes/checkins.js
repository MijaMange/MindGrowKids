import { Router } from 'express';
import { authRequired, roleRequired } from '../mw/auth.js';
import { Checkin } from '../models/mongo.js';
import mongoose from 'mongoose';
import { readFileDB, writeFileDB } from '../lib/db.js';
import { randomUUID } from 'crypto';

export const checkins = Router();

const USE_MONGO = !!(mongoose.connection && mongoose.connection.readyState === 1);

// GET /api/checkins (child) -> hämta alla checkins för inloggad barn
checkins.get('/checkins', authRequired, roleRequired('child'), async (req, res) => {
  if (USE_MONGO) {
    const rows = await Checkin.find({ studentId: req.user.id }).sort({ dateISO: -1 });
    res.json(rows.map((r) => ({
      id: r._id.toString(),
      emotion: r.emotion,
      note: r.note,
      drawingRef: r.drawingRef,
      dateISO: r.dateISO,
      mode: r.mode,
    })));
  } else {
    // FILE fallback
    const db = readFileDB();
    const rows = (db.checkins || [])
      .filter((c) => c.studentId === req.user.id)
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    res.json(rows);
  }
});

// Barn skapar checkin
checkins.post('/checkins', authRequired, roleRequired('child'), async (req, res) => {
  const { emotion, mode, note, drawingRef } = req.body || {};
  if (USE_MONGO) {
    const row = await Checkin.create({
      orgId: '',
      classId: '',
      studentId: req.user.id,
      emotion,
      mode,
      note: note || '',
      drawingRef: drawingRef || '',
      dateISO: new Date().toISOString(),
    });
    res.json({ ok: true, id: row._id.toString() });
  } else {
    // FILE fallback
    const db = readFileDB();
    const row = {
      id: randomUUID(),
      orgId: '',
      classId: '',
      studentId: req.user.id,
      emotion,
      mode,
      note: note || '',
      drawingRef: drawingRef || '',
      dateISO: new Date().toISOString(),
      createdAtISO: new Date().toISOString(),
    };
    db.checkins = db.checkins || [];
    db.checkins.push(row);
    writeFileDB(db);
    res.json({ ok: true, id: row.id });
  }
});

// Enkel veckosummering (agg på emotion)
checkins.get('/analytics/weekly', authRequired, roleRequired('parent', 'pro'), async (req, res) => {
  const from = new Date(Date.now() - 7 * 864e5);
  if (USE_MONGO) {
    const rows = await Checkin.find({ dateISO: { $gte: from.toISOString() } });
    const counts = rows.reduce((m, r) => {
      m[r.emotion] = (m[r.emotion] || 0) + 1;
      return m;
    }, {});
    res.json({
      from: from.toISOString(),
      to: new Date().toISOString(),
      buckets: counts,
      total: rows.length,
    });
  } else {
    // FILE fallback
    const db = readFileDB();
    const rows = (db.checkins || []).filter((c) => new Date(c.dateISO) >= from);
    const counts = rows.reduce((m, r) => {
      m[r.emotion] = (m[r.emotion] || 0) + 1;
      return m;
    }, {});
    res.json({
      from: from.toISOString(),
      to: new Date().toISOString(),
      buckets: counts,
      total: rows.length,
    });
  }
});
