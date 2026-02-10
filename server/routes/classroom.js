import { Router } from 'express';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { readFileDB, writeFileDB, useFileDBOnly } from '../lib/db.js';
import { authRequired, roleRequired } from '../mw/auth.js';
import { ClassModel } from '../models/class.js';
import { Kid, ParentUser, ProUser } from '../models/mongo.js';
import { randomUUID } from 'crypto';

const { Types: { ObjectId } } = mongoose;

export const classroom = Router();

const USE_MONGO = !!(mongoose.connection && mongoose.connection.readyState === 1);

// Hjälp: generera klasskod + PIN
function genCode(prefix = 'C') {
  return prefix + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}
function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
} // 4-siffrig

// POST /api/classes (pro-only) -> skapar klasskod
classroom.post(
  '/classes',
  authRequired,
  roleRequired('pro'),
  async (req, res) => {
    try {
      const { name } = req.body || {};
      const code = genCode('C');

      if (USE_MONGO) {
        const { ProUser } = await import('../models/mongo.js');
        // Skapa klass
        const c = await ClassModel.create({
          code,
          name: name || 'Min klass',
          ownerUserId: req.user.id,
        });
        // Uppdatera lärarens classCode
        const pro = await ProUser.findById(req.user.id);
        if (pro) {
          pro.classCode = code;
          await pro.save();
          console.log('[CLASSROOM] Updated pro classCode:', req.user.id, '->', code);
        }
        return res.json({ code: c.code, name: c.name });
      }

      // FILE fallback
      const db = readFileDB();
      db.classes = db.classes || [];
      db.classes.push({
        id: randomUUID(),
        code,
        name: name || 'Min klass',
        ownerUserId: req.user.id,
      });
      // Uppdatera lärarens classCode
      const pro = db.professionals?.find((p) => p.id === req.user.id);
      if (pro) {
        pro.classCode = code;
        console.log('[CLASSROOM] Updated pro classCode (file):', req.user.id, '->', code);
      }
      writeFileDB(db);
      res.json({ code, name: name || 'Min klass' });
    } catch (err) {
      console.error('[CLASSROOM] Error creating class:', err);
      res.status(500).json({ error: 'creation_failed', message: 'Kunde inte skapa klass' });
    }
  }
);

// GET /api/classes/:code/qrcode -> dataURL PNG för QR
classroom.get('/classes/:code/qrcode', async (req, res) => {
  const url = `mindgrow://class-login?code=${encodeURIComponent(req.params.code)}`;
  const dataUrl = await QRCode.toDataURL(url, { margin: 1, scale: 6 });
  const base64 = dataUrl.split(',')[1];
  const buf = Buffer.from(base64, 'base64');
  res.setHeader('Content-Type', 'image/png').send(buf);
});

// GET /api/classes/:code/students (pro-only) -> hämta elever i en klass
classroom.get(
  '/classes/:code/students',
  authRequired,
  roleRequired('pro'),
  async (req, res) => {
    try {
      const classCode = req.params.code;
      console.log('[CLASSROOM] Fetching students for classCode:', classCode);

      if (USE_MONGO) {
        const { Kid } = await import('../models/mongo.js');
        const rows = await Kid.find({ classCode }).select('_id name classCode');
        console.log('[CLASSROOM] Found', rows.length, 'students in MongoDB');
        return res.json(rows.map((r) => ({ id: r._id.toString(), name: r.name, classCode: r.classCode })));
      }

      // FILE fallback – emoji + ackumulerad sammanfattning (inga detaljer)
      const db = readFileDB();
      const avatars = db.avatars || [];
      const twoWeeksAgo = new Date(Date.now() - 14 * 864e5).toISOString();
      const recentCheckins = (db.checkins || []).filter((c) => c.dateISO >= twoWeeksAgo);

      function studentSummary(checks) {
        if (!checks || checks.length === 0) return 'Ingen data ännu';
        const counts = {};
        checks.forEach((c) => { const e = c.emotion || ''; counts[e] = (counts[e] || 0) + 1; });
        const total = checks.length;
        const happy = (counts.happy || 0) + (counts.calm || 0);
        const low = (counts.sad || 0) + (counts.tired || 0) + (counts.worried || 0) + (counts.afraid || 0) + (counts.angry || 0);
        if (happy / total >= 0.6) return 'Mår oftast bra';
        if (low / total >= 0.4) return 'Har haft några tunga dagar';
        return 'Varierande humör';
      }

      const codeNorm = (classCode || '').trim().toUpperCase();
      const rows = (db.kids || [])
        .filter((c) => c && (c.classCode || '').trim().toUpperCase() === codeNorm)
        .map((c) => {
          const emoji = c.emoji || avatars.find((a) => a.childRef === c.id)?.data?.emoji || '👤';
          const summary = studentSummary(recentCheckins.filter((ch) => ch.studentId === c.id));
          return { id: c.id, name: c.name, classCode: c.classCode, emoji, summary, gender: c.gender || null };
        });
      console.log('[CLASSROOM] Found', rows.length, 'students in file DB');
      res.json(rows);
    } catch (err) {
      console.error('[CLASSROOM] Error fetching students:', err);
      res.status(500).json({ error: 'fetch_failed', message: 'Kunde inte hämta elever' });
    }
  }
);

// GET /api/pro/my-class (pro-only) -> hämta lärarens klass och elever automatiskt
classroom.get(
  '/pro/my-class',
  authRequired,
  roleRequired('pro'),
  async (req, res) => {
    try {
      if (USE_MONGO) {
        const { ProUser, Kid } = await import('../models/mongo.js');
        const pro = await ProUser.findById(req.user.id);
        if (!pro) {
          return res.status(404).json({ error: 'pro_not_found' });
        }

        if (!pro.classCode) {
          return res.json({ classCode: null, students: [] });
        }

        const students = await Kid.find({ classCode: pro.classCode }).select('_id name classCode');
        return res.json({
          classCode: pro.classCode,
          students: students.map((s) => ({ id: s._id.toString(), name: s.name })),
        });
      }

      // FILE fallback
      const db = readFileDB();
      const userId = req.user?.id != null ? String(req.user.id) : '';
      const pro = (db.professionals || []).find((p) => String(p.id) === userId);
      if (!pro || !pro.classCode) {
        return res.json({ classCode: null, students: [] });
      }

      const students = (db.kids || [])
        .filter((k) => k.classCode === pro.classCode)
        .map((k) => ({ id: k.id, name: k.name }));

      res.json({ classCode: pro.classCode, students });
    } catch (err) {
      console.error('[CLASSROOM] Error fetching pro class:', err);
      res.status(200).json({ classCode: null, students: [] });
    }
  }
);

// Simulerad dagboksdata för simulerade klasser: 14 dagar, viktade känslor, deterministisk utifrån classCode
// Om klassen har 0 elever används en placeholder så att dagboken alltid visar data i översiktsvyn
function simulatedClassCheckins(classCode, studentIds) {
  const ids = (studentIds && studentIds.length > 0)
    ? studentIds
    : [`class-${classCode}`];
  const emotions = ['happy', 'calm', 'tired', 'sad', 'curious', 'angry'];
  const weights = [0.28, 0.25, 0.15, 0.08, 0.14, 0.10];
  let seed = 0;
  for (let i = 0; i < classCode.length; i++) seed = (seed * 31 + classCode.charCodeAt(i)) >>> 0;
  const next = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; };
  const pickEmotion = () => {
    const r = next();
    let s = 0;
    for (let j = 0; j < emotions.length; j++) {
      s += weights[j];
      if (r <= s) return emotions[j];
    }
    return emotions[0];
  };
  const out = [];
  for (const studentId of ids) {
    let studentSeed = seed;
    for (let i = 0; i < studentId.length; i++) studentSeed = (studentSeed * 31 + studentId.charCodeAt(i)) >>> 0;
    const origSeed = seed;
    seed = studentSeed;
    for (let d = 0; d < 14; d++) {
      const dayStart = new Date(Date.now() - d * 864e5);
      const count = d === 0 ? 1 : (next() > 0.4 ? 2 : 1);
      for (let c = 0; c < count; c++) {
        const offset = c * 3600 * (4 + Math.floor(next() * 4)) * 1000;
        out.push({
          id: `sim-${classCode}-${studentId}-${d}-${c}`,
          studentId,
          emotion: pickEmotion(),
          mode: 'text',
          note: '',
          drawingRef: '',
          dateISO: new Date(dayStart.getTime() + offset).toISOString(),
        });
      }
    }
    seed = origSeed;
  }
  return out.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
}

// GET /api/classes/:code/checkins (pro-only) -> hämta alla checkins för elever i klassen
classroom.get(
  '/classes/:code/checkins',
  authRequired,
  roleRequired('pro'),
  async (req, res) => {
    try {
      const classCode = req.params.code;

      if (USE_MONGO) {
        const { Checkin, Kid } = await import('../models/mongo.js');
        let students = await Kid.find({ classCode }).select('_id');
        let studentIds = students.map((s) => s._id.toString());
        // Översiktsläget använder fil-DB för klasser; om klassen bara finns där, hämta elever från fil-DB
        if (studentIds.length === 0) {
          const db = readFileDB();
          studentIds = (db.kids || [])
            .filter((k) => k.classCode === classCode)
            .map((k) => k.id);
        }
        const rows = await Checkin.find({ studentId: { $in: studentIds } })
          .sort({ dateISO: -1 });
        const mapped = rows.map((r) => ({
          id: r._id.toString(),
          emotion: r.emotion,
          note: r.note,
          drawingRef: r.drawingRef,
          dateISO: r.dateISO,
          mode: r.mode,
        }));
        if (mapped.length === 0) {
          return res.json(simulatedClassCheckins(classCode, studentIds));
        }
        return res.json(mapped);
      }

      const db = readFileDB();
      const studentIds = (db.kids || [])
        .filter((k) => k.classCode === classCode)
        .map((k) => k.id);
      let rows = (db.checkins || [])
        .filter((c) => studentIds.includes(c.studentId))
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
      if (rows.length === 0) {
        rows = simulatedClassCheckins(classCode, studentIds);
      }
      res.json(rows);
    } catch (err) {
      console.error('[CLASSROOM] Error fetching class checkins:', err);
      try {
        const code = req.params.code || '';
        return res.json(simulatedClassCheckins(code, []));
      } catch (e) {
        return res.json([]);
      }
    }
  }
);

// GET /api/child/linkcode (child) -> hämta permanent länkkod (söker i fil-DB och MongoDB)
classroom.get('/child/linkcode', authRequired, roleRequired('child'), async (req, res) => {
  const childId = req.user.id != null ? String(req.user.id) : '';
  const db = readFileDB();

  // Först fil-DB (så att det fungerar oavsett var barnet skapades)
  let kid = (db.kids || []).find((k) => String(k.id) === childId);
  if (kid) {
    if (!kid.linkCode) {
      kid.linkCode = String(Math.floor(100000 + Math.random() * 900000));
      const idx = db.kids.findIndex((k) => k.id === kid.id);
      if (idx > -1) {
        db.kids[idx] = kid;
        writeFileDB(db);
      }
    }
    return res.json({ linkCode: kid.linkCode });
  }

  // Sedan MongoDB
  if (mongoose.connection?.readyState === 1) {
    let mongoKid = await Kid.findById(req.user.id);
    if (!mongoKid && req.user.id) {
      try {
        mongoKid = await Kid.findById(new ObjectId(req.user.id));
      } catch (_) {}
    }
    if (mongoKid) {
      if (!mongoKid.linkCode) {
        mongoKid.linkCode = String(Math.floor(100000 + Math.random() * 900000));
        await mongoKid.save();
      }
      return res.json({ linkCode: mongoKid.linkCode });
    }
  }

  return res.status(404).json({ error: 'child_not_found' });
});

// POST /api/pin/request (child) -> generera temporär PIN som förälder kan skriva in
classroom.post('/pin/request', authRequired, roleRequired('child'), async (req, res) => {
  try {
    const pin = genPin();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min

    // PIN:ar sparas alltid i file-based DB (även om MongoDB används för användare)
    // Detta är enkelt och fungerar för båda fall
    const db = readFileDB();
    db.pins = db.pins || [];
    // Rensa utgångna PIN:ar
    db.pins = db.pins.filter((p) => p.expiresAt > Date.now());
    // Lägg till ny PIN
    db.pins.push({ pin, childId: req.user.id, expiresAt });
    writeFileDB(db);
    
    res.json({ pin, expiresAt });
  } catch (err) {
    console.error('[POST /api/pin/request] Error:', err);
    res.status(500).json({ error: 'pin_generation_failed', message: 'Kunde inte generera PIN.' });
  }
});

// POST /api/pin/link (parent) -> ange PIN eller länkkod för att länka barn
// Vid fil-DB (ingen MongoDB): endast fil-DB. Annars försök både fil-DB och MongoDB.
classroom.post('/pin/link', authRequired, roleRequired('parent'), async (req, res) => {
  const { pin, linkCode } = req.body || {};
  const parentIdStr = req.user.id != null ? String(req.user.id) : '';
  const parentEmail = req.user.email ? String(req.user.email).trim().toLowerCase() : '';
  const db = readFileDB();
  const fileOnly = useFileDBOnly();

  console.log('[PIN/LINK] File-DB only:', fileOnly, '| parentId:', parentIdStr || '(empty)', '| parents in DB:', (db.parents || []).length);

  if (!pin && !linkCode) {
    return res.status(400).json({ error: 'pin_or_linkcode_required', message: 'PIN eller länkkod krävs' });
  }

  // 1) Hämta childId från PIN (fil-DB) eller länkkod
  let childId = null;
  if (pin) {
    db.pins = db.pins || [];
    const pinStr = String(pin).trim();
    const item = db.pins.find((p) => String(p.pin).trim() === pinStr && p.expiresAt > Date.now());
    if (item) {
      childId = item.childId;
      db.pins = db.pins.filter((p) => String(p.pin).trim() !== pinStr);
      writeFileDB(db);
    }
  }
  if (!childId && linkCode) {
    if (!fileOnly && mongoose.connection?.readyState === 1) {
      const kid = await Kid.findOne({ linkCode });
      if (kid) childId = kid._id.toString();
    }
    if (!childId && db.kids) {
      const kid = db.kids.find((k) => String(k.linkCode) === String(linkCode));
      if (kid) childId = kid.id;
    }
  }

  if (!childId) {
    return res.status(400).json({ error: 'pin_invalid', message: 'Fel PIN/länkkod eller kod har gått ut.' });
  }

  // 2) Hitta eller skapa förälder – vid fil-DB endast fil-DB
  const fileParents = db.parents || [];
  let fileParent = fileParents.find((p) => String(p.id) === parentIdStr);
  if (!fileParent && parentEmail) {
    fileParent = fileParents.find((p) => p.email && String(p.email).trim().toLowerCase() === parentEmail);
  }
  if (fileParent) {
    fileParent.childId = childId;
    writeFileDB(db);
    console.log('[PIN/LINK] Linked (file DB):', fileParent.id, '-> child', childId);
    return res.json({ ok: true, childId });
  }

  if (!fileOnly && mongoose.connection?.readyState === 1) {
    try {
      let mongoParent = await ParentUser.findById(req.user.id);
      if (!mongoParent && parentEmail) {
        mongoParent = await ParentUser.findOne({ email: new RegExp(`^${parentEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      }
      if (mongoParent) {
        mongoParent.childId = childId;
        await mongoParent.save();
        return res.json({ ok: true, childId });
      }
    } catch (err) {
      console.error('[PIN/LINK] Mongo lookup failed:', err.message);
    }
  }

  // 3) Skapa förälder i fil-DB (t.ex. inloggad men ingen post än)
  const newParent = {
    id: parentIdStr || randomUUID(),
    email: parentEmail || '',
    name: (req.user.name && String(req.user.name).trim()) || 'Förälder',
    role: 'parent',
    childId,
  };
  db.parents = db.parents || [];
  db.parents.push(newParent);
  writeFileDB(db);
  console.log('[PIN/LINK] Created parent in file DB and linked:', newParent.id, '-> child', childId);
  return res.json({ ok: true, childId });
});

// Hjälp: hitta förälder – vid fil-DB endast fil-DB, annars fil-DB + MongoDB
async function findParentForRequest(req) {
  const parentIdStr = req.user.id != null ? String(req.user.id) : '';
  const parentEmail = req.user.email ? String(req.user.email).trim().toLowerCase() : '';
  const db = readFileDB();
  let fileParent = (db.parents || []).find((p) => String(p.id) === parentIdStr);
  if (!fileParent && parentEmail) {
    fileParent = (db.parents || []).find((p) => p.email && String(p.email).trim().toLowerCase() === parentEmail);
  }
  if (fileParent) return { source: 'file', parent: fileParent, db };
  if (!useFileDBOnly() && mongoose.connection?.readyState === 1) {
    try {
      let mongoParent = await ParentUser.findById(req.user.id);
      if (!mongoParent && req.user.id) {
        try {
          mongoParent = await ParentUser.findById(new ObjectId(req.user.id));
        } catch (_) {}
      }
      if (!mongoParent && parentEmail) {
        mongoParent = await ParentUser.findOne({ email: new RegExp(`^${parentEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      }
      if (mongoParent) return { source: 'mongo', parent: mongoParent };
    } catch (_) {}
  }
  return null;
}

// GET /api/parent/my-children (parent-only) -> hämta alla kopplade barn (söker i fil-DB och MongoDB)
classroom.get(
  '/parent/my-children',
  authRequired,
  roleRequired('parent'),
  async (req, res) => {
    try {
      const found = await findParentForRequest(req);
      if (!found) {
        return res.json({ children: [] });
      }

      const parent = found.parent;
      const childId = parent.childId;
      const children = [];

      if (childId) {
        if (found.source === 'file') {
          const child = (found.db.kids || []).find((k) => k.id === childId);
          if (child) children.push({ id: child.id, name: child.name });
        } else {
          const { Kid } = await import('../models/mongo.js');
          const child = await Kid.findById(childId).select('_id name');
          if (child) children.push({ id: child._id.toString(), name: child.name });
        }
      }

      res.json({ children });
    } catch (err) {
      console.error('[CLASSROOM] Error fetching parent children:', err);
      res.status(500).json({ error: 'fetch_failed', message: 'Kunde inte hämta barn' });
    }
  }
);

// GET /api/parent/children/:childId/checkins (parent-only) -> hämta checkins för specifikt barn
classroom.get(
  '/parent/children/:childId/checkins',
  authRequired,
  roleRequired('parent'),
  async (req, res) => {
    try {
      const childId = req.params.childId;
      const found = await findParentForRequest(req);
      if (!found || found.parent.childId !== childId) {
        return res.status(403).json({ error: 'not_authorized', message: 'Du har inte tillgång till detta barn' });
      }

      if (found.source === 'mongo') {
        const { Kid, Checkin } = await import('../models/mongo.js');
        const child = await Kid.findById(childId).select('name');
        const checkins = await Checkin.find({ studentId: childId }).sort({ dateISO: -1 });
        return res.json({
          childName: child?.name || '',
          checkins: checkins.map((r) => ({
            id: r._id.toString(),
            emotion: r.emotion,
            note: r.note,
            drawingRef: r.drawingRef,
            dateISO: r.dateISO,
            mode: r.mode,
          })),
        });
      }

      const db = found.db;
      const child = (db.kids || []).find((k) => k.id === childId);
      const checkins = (db.checkins || [])
        .filter((c) => c.studentId === childId)
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

      res.json({
        childName: child?.name || '',
        checkins,
      });
    } catch (err) {
      console.error('[CLASSROOM] Error fetching child checkins:', err);
      res.status(500).json({ error: 'fetch_failed', message: 'Kunde inte hämta dagbok' });
    }
  }
);

// GET /api/analytics/export.csv (parent|pro) -> CSV med checkins (enkelt)
classroom.get(
  '/analytics/export.csv',
  authRequired,
  roleRequired('parent', 'pro'),
  (req, res) => {
    const db = readFileDB();
    let rows = db.checkins.slice();

    if (req.user.role === 'parent') {
      const me = db.users.find((u) => u.id === req.user.id);
      if (me?.childId) {
        rows = rows.filter((r) => r.childId === me.childId);
      } else {
        rows = [];
      }
    }

    const csv = ['dateISO,emotion,note']
      .concat(
        rows.map((r) => {
          const safe = ('' + (r.note || '')).replaceAll('"', '""');
          return `${r.dateISO},${r.emotion},"${safe}"`;
        })
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
    res.send(csv);
  }
);


