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

// Barn skapar checkin (emotion, mode, note, drawingRef, dateISO optional)
checkins.post('/checkins', authRequired, roleRequired('child'), async (req, res) => {
  const { emotion, mode, note, drawingRef, dateISO: bodyDate } = req.body || {};
  const dateISO = bodyDate && /^\d{4}-\d{2}-\d{2}T/.test(bodyDate) ? bodyDate : new Date().toISOString();
  if (USE_MONGO) {
    const row = await Checkin.create({
      orgId: '',
      classId: '',
      studentId: req.user.id,
      emotion: emotion || 'calm',
      mode: mode || 'text',
      note: note || '',
      drawingRef: drawingRef || '',
      dateISO,
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
      emotion: emotion || 'calm',
      mode: mode || 'text',
      note: note || '',
      drawingRef: drawingRef || '',
      dateISO,
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
  try {
    const from = new Date(Date.now() - 7 * 864e5);
    if (USE_MONGO) {
      const rows = await Checkin.find({ dateISO: { $gte: from.toISOString() } });
      const counts = rows.reduce((m, r) => {
        m[r.emotion] = (m[r.emotion] || 0) + 1;
        return m;
      }, {});
      return res.json({
        from: from.toISOString(),
        to: new Date().toISOString(),
        buckets: counts,
        timeSeries: [],
        total: rows.length,
      });
    }
    const db = readFileDB();
    const rows = (db.checkins || []).filter((c) => c?.dateISO && new Date(c.dateISO) >= from);
    const counts = rows.reduce((m, r) => {
      const e = r.emotion || 'unknown';
      m[e] = (m[e] || 0) + 1;
      return m;
    }, {});
    return res.json({
      from: from.toISOString(),
      to: new Date().toISOString(),
      buckets: counts,
      timeSeries: [],
      total: rows.length,
    });
  } catch (err) {
    console.error('[GET /analytics/weekly]', err);
    res.status(200).json({
      from: new Date(Date.now() - 7 * 864e5).toISOString(),
      to: new Date().toISOString(),
      buckets: {},
      timeSeries: [],
      total: 0,
    });
  }
});

// Sammanfattning (samma format som frontend förväntar sig) – returnera tom vid fel
checkins.get('/analytics/summary', authRequired, roleRequired('parent', 'pro'), async (req, res) => {
  try {
    const from = new Date(Date.now() - 7 * 86400000).toISOString();
    const to = new Date().toISOString();
    if (USE_MONGO) {
      const rows = await Checkin.find({ dateISO: { $gte: from, $lte: to } });
      const counts = rows.reduce((m, r) => { m[r.emotion] = (m[r.emotion] || 0) + 1; return m; }, {});
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const topEmotion = entries[0]?.[0] || '';
      const total = rows.length;
      return res.json({ summaryText: total ? `${topEmotion}: ${entries[0]?.[1]} st` : 'Ingen data', topEmotion, total });
    }
    const db = readFileDB();
    const rows = (db.checkins || []).filter((c) => c?.dateISO && c.dateISO >= from && c.dateISO <= to);
    const counts = rows.reduce((m, r) => { const e = r.emotion || 'unknown'; m[e] = (m[e] || 0) + 1; return m; }, {});
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topEmotion = entries[0]?.[0] || '';
    return res.json({ summaryText: rows.length ? `${topEmotion}: ${entries[0]?.[1]} st` : 'Ingen data', topEmotion, total: rows.length });
  } catch (err) {
    console.error('[GET /analytics/summary]', err);
    res.status(200).json({ summaryText: '', topEmotion: '', total: 0 });
  }
});
