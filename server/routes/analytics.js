import { Router } from 'express';
import { authRequired, roleRequired, setScope } from '../mw/auth.js';
import { listCheckins, summarize } from '../data/adapter.js';
import OpenAI from 'openai';
import { readFileDB } from '../lib/db.js';
import {
  sanitizeInput,
  sanitizeSystemPrompt,
  validateOutput,
  rateLimiter,
  safeLog,
} from '../utils/ai-safety.js';

export const analytics = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: generera mjuk sammanfattning utan AI
function gentleSummary(aggregation) {
  const { buckets, total } = aggregation;
  if (total === 0) {
    return 'Inga registreringar hittades för denna period.';
  }

  const entries = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
  const topEmotion = entries[0]?.[0] || 'unknown';
  const topCount = entries[0]?.[1] || 0;
  const topPercent = Math.round((topCount / total) * 100);

  const emotionLabels = {
    happy: 'glädje',
    calm: 'lugn',
    tired: 'trötthet',
    sad: 'ledsenhet',
    curious: 'nyfikenhet',
    angry: 'ilska',
  };

  const label = emotionLabels[topEmotion] || topEmotion;

  let text = `Under denna period registrerades ${total} känslouttryck. `;
  text += `Den vanligaste känslan var ${label} (${topPercent}% av registreringarna). `;

  if (entries.length > 1) {
    const second = entries[1];
    if (second && second[1] > 0) {
      const secondLabel = emotionLabels[second[0]] || second[0];
      text += `Även ${secondLabel} var vanligt förekommande.`;
    }
  }

  return text;
}

// GET /api/analytics/weekly?from&to (ROLE: parent|pro)
analytics.get('/analytics/weekly', authRequired, roleRequired('parent', 'pro'), setScope, async (req, res) => {
  const { from, to } = req.query;
  const { orgId, classId } = req.scope || {};

  if (!orgId || !classId) {
    return res.status(400).json({ error: 'scope_missing' });
  }

  try {
    const aggregation = await summarize({ orgId, classId, from, to });
    res.json({
      from: from || new Date(Date.now() - 7 * 86400000).toISOString(),
      to: to || new Date().toISOString(),
      buckets: aggregation.buckets,
      timeSeries: aggregation.timeSeries,
      total: aggregation.total,
    });
  } catch (err) {
    console.error('[GET /analytics/weekly]', err);
    res.status(500).json({ error: 'analytics_failed' });
  }
});

// GET /api/analytics/summary?from&to (ROLE: parent|pro)
analytics.get('/analytics/summary', authRequired, roleRequired('parent', 'pro'), setScope, async (req, res) => {
  const { from, to } = req.query;
  const { orgId, classId } = req.scope || {};
  const userId = req.user?.id || req.user?._id?.toString() || 'anonymous';

  if (!orgId || !classId) {
    return res.status(400).json({ error: 'scope_missing' });
  }

  // Rate limiting
  if (!rateLimiter.isAllowed(userId)) {
    const remaining = rateLimiter.getRemaining(userId);
    return res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'För många förfrågningar. Försök igen om en minut.',
      retryAfter: 60,
    });
  }

  try {
    const aggregation = await summarize({ orgId, classId, from, to });

    let summaryText = '';
    let topEmotion = '';

    // Försök med AI om API-nyckel finns
    if (process.env.OPENAI_API_KEY && aggregation.total > 0) {
      try {
        // Sanitize inputs
        const system = sanitizeSystemPrompt(
          `Du är en varm, beskrivande observatör. Skriv 2-3 meningar på svenska som beskriver känslomönstret baserat på aggregerad data. Använd INGA råd, bedömningar eller tolkningar. Bara beskriv vad som syns.`
        );
        const userText = sanitizeInput(aggregation);

        const resp = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: userText },
          ],
          temperature: 0.3,
          max_tokens: 120,
        });

        const aiResponse = resp.choices?.[0]?.message?.content?.trim() || '';

        // Validate output
        if (aiResponse && validateOutput(aiResponse)) {
          summaryText = aiResponse;
          safeLog(userText, aiResponse, 'analytics/summary');
        } else {
          // Fallback to gentle summary if validation fails
          console.warn('[AI-SAFETY] Output validation failed, using fallback');
          safeLog(userText, aiResponse, 'analytics/summary (REJECTED)');
          summaryText = gentleSummary(aggregation);
        }
      } catch (aiErr) {
        console.warn('[AI summary failed]', aiErr?.message);
        summaryText = gentleSummary(aggregation);
      }
    } else {
      summaryText = gentleSummary(aggregation);
    }

    // Hitta top emotion
    const entries = Object.entries(aggregation.buckets).sort((a, b) => b[1] - a[1]);
    topEmotion = entries[0]?.[0] || '';

    res.json({
      summaryText,
      topEmotion,
      total: aggregation.total,
    });
  } catch (err) {
    console.error('[GET /analytics/summary]', err);
    res.status(500).json({ error: 'summary_failed' });
  }
});

// GET /api/export.csv?from&to (ROLE: parent|pro)
analytics.get('/export.csv', authRequired, roleRequired('parent', 'pro'), setScope, async (req, res) => {
  const { from, to } = req.query;
  const { orgId, classId } = req.scope || {};

  if (!orgId || !classId) {
    return res.status(400).json({ error: 'scope_missing' });
  }

  try {
    const aggregation = await summarize({ orgId, classId, from, to });

    // Exportera aggregerat: datum, emotion, count
    const rows = ['date,emotion,count'];
    for (const ts of aggregation.timeSeries) {
      for (const [emotion, count] of Object.entries(ts.buckets)) {
        rows.push(`${ts.date},${emotion},${count}`);
      }
    }

    const csv = rows.join('\n');
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=mindgrow-export-${dateStr}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('[GET /export.csv]', err);
    res.status(500).json({ error: 'export_failed' });
  }
});




