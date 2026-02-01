import { Router } from 'express';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { readFileDB, writeFileDB } from '../lib/db.js';
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

      // FILE fallback
      const db = readFileDB();
      const rows = (db.kids || [])
        .filter((c) => c.classCode === classCode)
        .map((c) => ({ id: c.id, name: c.name, classCode: c.classCode }));
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
      const pro = db.professionals?.find((p) => p.id === req.user.id);
      if (!pro || !pro.classCode) {
        return res.json({ classCode: null, students: [] });
      }

      const students = (db.kids || [])
        .filter((k) => k.classCode === pro.classCode)
        .map((k) => ({ id: k.id, name: k.name }));

      res.json({ classCode: pro.classCode, students });
    } catch (err) {
      console.error('[CLASSROOM] Error fetching pro class:', err);
      res.status(500).json({ error: 'fetch_failed', message: 'Kunde inte hämta klass' });
    }
  }
);

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
        // Hämta alla elever i klassen
        const students = await Kid.find({ classCode }).select('_id');
        const studentIds = students.map((s) => s._id.toString());
        
        // Hämta alla checkins för dessa elever
        const rows = await Checkin.find({ studentId: { $in: studentIds } })
          .sort({ dateISO: -1 });
        
        return res.json(rows.map((r) => ({
          id: r._id.toString(),
          emotion: r.emotion,
          note: r.note,
          drawingRef: r.drawingRef,
          dateISO: r.dateISO,
          mode: r.mode,
        })));
      }

      // FILE fallback
      const db = readFileDB();
      const studentIds = (db.kids || [])
        .filter((k) => k.classCode === classCode)
        .map((k) => k.id);
      
      const rows = (db.checkins || [])
        .filter((c) => studentIds.includes(c.studentId))
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
      
      res.json(rows);
    } catch (err) {
      console.error('[CLASSROOM] Error fetching class checkins:', err);
      res.status(500).json({ error: 'fetch_failed', message: 'Kunde inte hämta klassens checkins' });
    }
  }
);

// GET /api/child/linkcode (child) -> hämta permanent länkkod
classroom.get('/child/linkcode', authRequired, roleRequired('child'), async (req, res) => {
  if (USE_MONGO) {
    const kid = await Child.findById(req.user.id);
    if (!kid) return res.status(404).json({ error: 'child_not_found' });
    
    // Generera länkkod om den saknas
    if (!kid.linkCode) {
      kid.linkCode = String(Math.floor(100000 + Math.random() * 900000));
      await kid.save();
    }
    
    return res.json({ linkCode: kid.linkCode });
  }

  // FILE fallback
  const db = readFileDB();
  const kid = db.kids?.find((k) => k.id === req.user.id);
  if (!kid) return res.status(404).json({ error: 'child_not_found' });

  // Generera länkkod om den saknas
  if (!kid.linkCode) {
    kid.linkCode = String(Math.floor(100000 + Math.random() * 900000));
    const kidIndex = db.kids.findIndex((k) => k.id === kid.id);
    if (kidIndex > -1) {
      db.kids[kidIndex] = kid;
      writeFileDB(db);
    }
  }

  res.json({ linkCode: kid.linkCode });
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
classroom.post('/pin/link', authRequired, roleRequired('parent'), async (req, res) => {
  const { pin, linkCode } = req.body || {};
  
  console.log('[PIN/LINK] Request from parent:', req.user.id, { hasPin: !!pin, hasLinkCode: !!linkCode });
  
  if (!pin && !linkCode) {
    return res.status(400).json({ error: 'pin_or_linkcode_required', message: 'PIN eller länkkod krävs' });
  }

  if (USE_MONGO) {
    try {
      let childId = null;

      // Försök först med temporär PIN (PIN:ar sparas i file-based DB även vid MongoDB)
      if (pin) {
        const db = readFileDB();
        db.pins = db.pins || [];
        console.log('[PIN/LINK] Looking for PIN:', pin, 'Available pins:', db.pins.length);
        const pinStr = String(pin).trim();
        const item = db.pins.find((p) => String(p.pin).trim() === pinStr && p.expiresAt > Date.now());
        if (item) {
          childId = item.childId;
          console.log('[PIN/LINK] Found PIN, childId:', childId);
          // Rensa PIN
          db.pins = db.pins.filter((p) => String(p.pin).trim() !== pinStr);
          writeFileDB(db);
        } else {
          console.log('[PIN/LINK] PIN not found or expired');
        }
      }

      // Om ingen PIN fungerade, försök med permanent länkkod
      if (!childId && linkCode) {
        console.log('[PIN/LINK] Looking for linkCode:', linkCode);
        const kid = await Child.findOne({ linkCode });
        if (kid) {
          childId = kid._id.toString();
          console.log('[PIN/LINK] Found linkCode, childId:', childId);
        } else {
          console.log('[PIN/LINK] linkCode not found');
        }
      }

      if (!childId) {
        return res.status(400).json({ error: 'pin_invalid', message: 'Fel PIN/länkkod eller kod har gått ut.' });
      }

      // Länka: lagra childId på parent-user (MongoDB)
      console.log('[PIN/LINK] Looking for parent in MongoDB:', req.user.id, 'type:', typeof req.user.id);
      
      // Försök hitta föräldern - MongoDB kan behöva ObjectId
      let parent = null;
      try {
        // Försök först med direkt ID (kan vara ObjectId eller sträng)
        parent = await ParentUser.findById(req.user.id);
        if (!parent) {
          // Om det misslyckas, försök konvertera till ObjectId
          try {
            const objectId = new ObjectId(req.user.id);
            parent = await ParentUser.findById(objectId);
          } catch (objIdErr) {
            console.log('[PIN/LINK] ObjectId conversion failed:', objIdErr.message);
          }
        }
      } catch (idErr) {
        console.log('[PIN/LINK] findById failed:', idErr.message);
      }
      
      if (!parent) {
        console.error('[PIN/LINK] Parent not found in MongoDB:', req.user.id);
        // Fallback: försök hitta i file-based DB också
        const db = readFileDB();
        const fileParent = db.parents?.find((p) => p.id === req.user.id);
        if (fileParent) {
          console.log('[PIN/LINK] Found parent in file DB, linking there');
          fileParent.childId = childId;
          writeFileDB(db);
          return res.json({ ok: true, childId });
        }
        console.error('[PIN/LINK] Parent not found in either MongoDB or file DB');
        return res.status(400).json({ error: 'user_missing', message: 'Föräldrakonto hittades inte. Logga ut och in igen.' });
      }

      parent.childId = childId;
      await parent.save();
      console.log('[PIN/LINK] Successfully linked parent', req.user.id, 'to child', childId, 'in MongoDB');

      return res.json({ ok: true, childId });
    } catch (err) {
      console.error('[POST /api/pin/link] MongoDB error:', err);
      // Fall through to file-based fallback
    }
  }

  // FILE fallback (eller om MongoDB misslyckades)
  try {
    const db = readFileDB();
    let childId = null;

    // Försök först med temporär PIN
    if (pin) {
      db.pins = db.pins || [];
      console.log('[PIN/LINK] Looking for PIN:', pin, 'Available pins:', db.pins.length);
      // Normalisera PIN till sträng för jämförelse
      const pinStr = String(pin).trim();
      const item = db.pins.find((p) => String(p.pin).trim() === pinStr && p.expiresAt > Date.now());
      if (item) {
        childId = item.childId;
        console.log('[PIN/LINK] Found PIN, childId:', childId);
        // Rensa PIN
        db.pins = db.pins.filter((p) => String(p.pin).trim() !== pinStr);
        writeFileDB(db);
      } else {
        console.log('[PIN/LINK] PIN not found or expired. Current time:', Date.now());
        console.log('[PIN/LINK] Available pins:', db.pins.map(p => ({ pin: p.pin, expiresAt: p.expiresAt, expired: p.expiresAt <= Date.now() })));
      }
    }

    // Om ingen PIN fungerade, försök med permanent länkkod
    if (!childId && linkCode) {
      const kid = db.kids?.find((k) => k.linkCode === linkCode);
      if (kid) {
        childId = kid.id;
      }
    }

    if (!childId) {
      return res.status(400).json({ error: 'pin_invalid', message: 'Fel PIN/länkkod eller kod har gått ut.' });
    }

      // länka: lagra childId på parent-user
      console.log('[PIN/LINK] Looking for parent:', req.user.id, 'in parents:', db.parents?.length || 0);
      const u = db.parents?.find((p) => p.id === req.user.id);
      if (!u) {
        console.error('[PIN/LINK] Parent not found:', req.user.id);
        return res.status(400).json({ error: 'user_missing', message: 'Föräldrakonto hittades inte.' });
      }

      u.childId = childId;
      writeFileDB(db);
      console.log('[PIN/LINK] Successfully linked parent', req.user.id, 'to child', childId);
    
    return res.json({ ok: true, childId });
  } catch (err) {
    console.error('[POST /api/pin/link] Error:', err);
    return res.status(500).json({ error: 'link_failed', message: 'Kunde inte länka. Försök igen.' });
  }
});

// GET /api/parent/my-children (parent-only) -> hämta alla kopplade barn
classroom.get(
  '/parent/my-children',
  authRequired,
  roleRequired('parent'),
  async (req, res) => {
    try {
      if (USE_MONGO) {
        const { ParentUser, Kid } = await import('../models/mongo.js');
        const parent = await ParentUser.findById(req.user.id);
        if (!parent) {
          return res.status(404).json({ error: 'parent_not_found' });
        }

        // För nu stödjer vi bara ett barn per förälder (childId)
        // Kan utökas till childIds array senare
        const children = [];
        if (parent.childId) {
          const child = await Kid.findById(parent.childId).select('_id name');
          if (child) {
            children.push({ id: child._id.toString(), name: child.name });
          }
        }

        return res.json({ children });
      }

      // FILE fallback
      const db = readFileDB();
      const parent = db.parents?.find((p) => p.id === req.user.id);
      if (!parent) {
        return res.status(404).json({ error: 'parent_not_found' });
      }

      const children = [];
      if (parent.childId) {
        const child = db.kids?.find((k) => k.id === parent.childId);
        if (child) {
          children.push({ id: child.id, name: child.name });
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

      // Verifiera att föräldern är kopplad till detta barn
      if (USE_MONGO) {
        const { ParentUser, Kid, Checkin } = await import('../models/mongo.js');
        const parent = await ParentUser.findById(req.user.id);
        if (!parent || parent.childId !== childId) {
          return res.status(403).json({ error: 'not_authorized', message: 'Du har inte tillgång till detta barn' });
        }

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

      // FILE fallback
      const db = readFileDB();
      const parent = db.parents?.find((p) => p.id === req.user.id);
      if (!parent || parent.childId !== childId) {
        return res.status(403).json({ error: 'not_authorized', message: 'Du har inte tillgång till detta barn' });
      }

      const child = db.kids?.find((k) => k.id === childId);
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


