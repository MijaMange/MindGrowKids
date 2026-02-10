import { Router } from 'express';
import { authRequired, roleRequired, setScope } from '../mw/auth.js';
import { createCheckin } from '../data/adapter.js';

export const checkins = Router();

// POST /api/checkins (ROLE: child)
checkins.post('/checkins', authRequired, roleRequired('child'), setScope, async (req, res) => {
  const { emotion, mode, note, drawingRef, clientId } = req.body || {};
  const { orgId, classId, studentId } = req.scope || {};

  if (!emotion || !mode) {
    return res.status(400).json({ error: 'emotion_and_mode_required' });
  }

  if (!orgId || !classId || !studentId) {
    return res.status(400).json({ error: 'scope_missing' });
  }

  try {
    const checkin = await createCheckin({
      orgId,
      classId,
      studentId,
      emotion,
      mode,
      note,
      drawingRef,
      dateISO: new Date().toISOString(),
      clientId, // Include clientId for duplicate detection
    });

    // Award mood (försök via HTTP om möjligt, annars ignorera)
    try {
      const PORT = process.env.PORT || 4000;
      await fetch(`http://localhost:${PORT}/api/mood/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: req.headers.authorization || '',
        },
        body: JSON.stringify({ reason: 'checkin_' + emotion }),
      });
    } catch {
      // Ignore mood award failure
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[POST /checkins]', err);
    res.status(500).json({ error: 'checkin_failed' });
  }
});

