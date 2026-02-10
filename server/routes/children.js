import { Router } from 'express';
import { authRequired, roleRequired } from '../mw/auth.js';
import { Kid } from '../models/mongo.js';
import mongoose from 'mongoose';
import { readFileDB, writeFileDB } from '../lib/db.js';
import { getAgeBandFromDob, isValidAgeBand, DEFAULT_AGE_BAND } from '../utils/age.js';

export const children = Router();

function isMongoConnected() {
  return !!(mongoose.connection && mongoose.connection.readyState === 1);
}

// GET /api/children/me - Get current child's profile
children.get('/children/me', authRequired, roleRequired('child'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const kid = await Kid.findById(req.user.id);
      if (!kid) {
        return res.status(404).json({ error: 'child_not_found' });
      }
      const ageGroup = kid.dateOfBirth
        ? getAgeBandFromDob(kid.dateOfBirth)
        : (kid.ageGroup || DEFAULT_AGE_BAND);
      return res.json({
        id: kid._id.toString(),
        name: kid.name,
        email: kid.email,
        classCode: kid.classCode,
        ageGroup,
        dateOfBirth: kid.dateOfBirth ? kid.dateOfBirth.toISOString().slice(0, 10) : null,
      });
    }

    // FILE fallback
    const db = readFileDB();
    const kid = (db.kids || []).find((k) => k.id === req.user.id);
    if (!kid) {
      return res.status(404).json({ error: 'child_not_found' });
    }
    const ageGroup = kid.dateOfBirth
      ? getAgeBandFromDob(kid.dateOfBirth)
      : (kid.ageGroup || DEFAULT_AGE_BAND);
    return res.json({
      id: kid.id,
      name: kid.name,
      email: kid.email,
      classCode: kid.classCode,
      ageGroup,
      dateOfBirth: kid.dateOfBirth || null,
    });
  } catch (err) {
    console.error('[CHILDREN] Error fetching child:', err);
    res.status(500).json({ error: 'fetch_failed', message: 'Kunde inte hämta profil' });
  }
});

// POST /api/children/age - Update child's age group
children.post('/children/age', authRequired, roleRequired('child'), async (req, res) => {
  try {
    const { ageGroup } = req.body;
    console.log('[CHILDREN] Updating age for child:', req.user.id, 'to:', ageGroup);
    
    if (!ageGroup || !['4-5', '6-7', '8-10'].includes(ageGroup)) {
      console.error('[CHILDREN] Invalid age group:', ageGroup);
      return res.status(400).json({ error: 'invalid_age_group', message: 'Ogiltig åldersgrupp' });
    }

    if (isMongoConnected()) {
      const kid = await Kid.findByIdAndUpdate(
        req.user.id,
        { ageGroup },
        { new: true }
      );
      if (!kid) {
        console.error('[CHILDREN] Child not found in MongoDB:', req.user.id);
        return res.status(404).json({ error: 'child_not_found', message: 'Barnet hittades inte' });
      }
      console.log('[CHILDREN] Successfully updated age in MongoDB:', kid.ageGroup);
      return res.json({ ok: true, ageGroup: kid.ageGroup });
    }

    // FILE fallback
    const db = readFileDB();
    const kidIndex = (db.kids || []).findIndex((k) => k.id === req.user.id);
    if (kidIndex === -1) {
      console.error('[CHILDREN] Child not found in file DB:', req.user.id);
      return res.status(404).json({ error: 'child_not_found', message: 'Barnet hittades inte' });
    }
    db.kids[kidIndex].ageGroup = ageGroup;
    writeFileDB(db);
    console.log('[CHILDREN] Successfully updated age in file DB:', ageGroup);
    return res.json({ ok: true, ageGroup });
  } catch (err) {
    console.error('[CHILDREN] Error updating age:', err);
    res.status(500).json({ error: 'update_failed', message: 'Kunde inte uppdatera ålder' });
  }
});

// GET /api/children/:id - Get child by ID (for parents)
children.get('/children/:id', authRequired, roleRequired('parent'), async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const kid = await Kid.findById(id);
      if (!kid) {
        return res.status(404).json({ error: 'child_not_found' });
      }
      const ageGroup = kid.dateOfBirth
        ? getAgeBandFromDob(kid.dateOfBirth)
        : (kid.ageGroup || DEFAULT_AGE_BAND);
      return res.json({
        id: kid._id.toString(),
        name: kid.name,
        email: kid.email,
        classCode: kid.classCode,
        ageGroup,
      });
    }

    // FILE fallback
    const db = readFileDB();
    const kid = (db.kids || []).find((k) => k.id === id);
    if (!kid) {
      return res.status(404).json({ error: 'child_not_found' });
    }
    const ageGroup = kid.dateOfBirth
      ? getAgeBandFromDob(kid.dateOfBirth)
      : (kid.ageGroup || DEFAULT_AGE_BAND);
    return res.json({
      id: kid.id,
      name: kid.name,
      email: kid.email,
      classCode: kid.classCode,
      ageGroup,
    });
  } catch (err) {
    console.error('[CHILDREN] Error fetching child:', err);
    res.status(500).json({ error: 'fetch_failed', message: 'Kunde inte hämta barn' });
  }
});

// POST /api/children/:id/age - Update child's age group (for parents)
children.post('/children/:id/age', authRequired, roleRequired('parent'), async (req, res) => {
  try {
    const { id } = req.params;
    const { ageGroup } = req.body;
    if (!isValidAgeBand(ageGroup)) {
      return res.status(400).json({ error: 'invalid_age_group' });
    }

    if (isMongoConnected()) {
      const kid = await Kid.findByIdAndUpdate(
        id,
        { ageGroup },
        { new: true }
      );
      if (!kid) {
        return res.status(404).json({ error: 'child_not_found' });
      }
      return res.json({ ok: true, ageGroup: kid.ageGroup });
    }

    // FILE fallback
    const db = readFileDB();
    const kidIndex = (db.kids || []).findIndex((k) => k.id === id);
    if (kidIndex === -1) {
      return res.status(404).json({ error: 'child_not_found' });
    }
    db.kids[kidIndex].ageGroup = ageGroup;
    writeFileDB(db);
    return res.json({ ok: true, ageGroup });
  } catch (err) {
    console.error('[CHILDREN] Error updating age:', err);
    res.status(500).json({ error: 'update_failed', message: 'Kunde inte uppdatera ålder' });
  }
});
