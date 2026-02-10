import { Router } from 'express';

export const listen = Router();

// Valid emotions
const VALID_EMOTIONS = ['happy', 'calm', 'tired', 'sad', 'curious', 'angry'];

// Max note length
const MAX_NOTE_LENGTH = 240;

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute per IP

/**
 * Simple rate limiter - checks if IP has exceeded request limit
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true; // Allowed
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // Rate limited
  }

  record.count++;
  return true; // Allowed
}

// Cleanup old rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Sanitize note text
 * - Strip HTML tags
 * - Limit length
 * - Remove control characters
 */
function sanitizeNote(note) {
  if (!note || typeof note !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = note.replace(/<[^>]*>/g, '');

  // Remove control characters (keep newlines, tabs, spaces)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Trim and limit length
  sanitized = sanitized.trim().slice(0, MAX_NOTE_LENGTH);

  return sanitized;
}

// Length tiers for note (characters)
const NOTE_SHORT = 40;   // under = kort mening
const NOTE_MEDIUM = 100; // under = medellång, över = lång text

/**
 * Detect theme from keywords (Swedish). Returns first match.
 * All static – no AI, safe reflective themes only.
 */
function detectTheme(note) {
  if (!note || typeof note !== 'string') return null;
  const n = note.trim().toLowerCase();
  const themes = [
    {
      key: 'school',
      regex: /\b(skol(a|an|en)?|lärare|klass|lektion|rast|läxa)\b/,
      replies: [
        'Det låter som att det har varit mycket med skolan.',
        'Skolan kan kännas stor ibland. Tack för att du berättar.',
      ],
    },
    {
      key: 'friends',
      regex: /\b(kompis|kompisar|vän|vänner|leka|lekte|lek)\b/,
      replies: [
        'Det kan kännas viktigt hur det är med kompisar.',
        'Tack för att du berättar om det som händer med vänner.',
      ],
    },
    {
      key: 'family',
      regex: /\b(mamma|pappa|morsa|farsa|familj|hemma)\b/,
      replies: [
        'Familjen kan betyda mycket. Tack för att du delar med dig.',
        'Det är fint att du berättar om det som händer hemma.',
      ],
    },
    {
      key: 'siblings',
      regex: /\b(syskon|bror|syster|brorsa|syrra)\b/,
      replies: [
        'Syskon kan ibland kännas både roligt och jobbigt.',
        'Tack för att du berättar om det som händer hemma.',
      ],
    },
    {
      key: 'scared',
      regex: /\b(rädd|otrygg|skräm(m|t)|mardröm)\b/,
      replies: [
        'Det är okej att känna sig rädd ibland. Tack för att du berättar.',
        'Det kan kännas stort att berätta om det som känns otryggt.',
      ],
    },
    {
      key: 'bad_day',
      regex: /\b(tråkig|tråkigt|dålig|dåligt|jobbig|surt|svårt)\b/,
      replies: [
        'Det låter som en tuff dag. Tack för att du delar med dig.',
        'Ibland är dagarna tunga. Det är bra att du berättar.',
      ],
    },
    {
      key: 'fun',
      regex: /\b(rolig|roligt|kul|skoj|glad|skratta)\b/,
      replies: [
        'Det låter roligt! Tack för att du delar med dig.',
        'Så fint att du berättar om det som varit kul.',
      ],
    },
  ];
  for (const t of themes) {
    if (t.regex.test(n)) return t;
  }
  return null;
}

/**
 * Generate reflective, non-advisory reply in Swedish.
 * Adapted by note length and optional keyword theme.
 * No "vill du berätta mer" – if they wanted to, they would have.
 */
function generateReply(emotion, note) {
  const baseReplies = {
    happy: [
      'Det låter glatt. Tack för att du delar med dig.',
      'Jag hör att du känner dig glad. Det är fint att du berättar.',
      'Glädje är viktigt. Tack för att du delar det med mig.',
    ],
    calm: [
      'Det låter lugnande. Tack för att du delar med dig.',
      'Jag hör att du känner dig lugn. Det är skönt att höra.',
      'Lugn är en fin känsla. Tack för att du berättar.',
    ],
    tired: [
      'Det låter tröttsamt. Tack för att du delar med dig.',
      'Jag hör att du känner dig trött. Det är okej att vila.',
      'Trötthet är en naturlig känsla. Tack för att du berättar.',
    ],
    sad: [
      'Det låter tungt. Tack för att du delar med dig.',
      'Jag hör att du känner dig ledsen. Det är okej att känna så.',
      'Ledsenhet är en viktig känsla. Tack för att du delar den med mig.',
    ],
    curious: [
      'Det låter nyfiket. Tack för att du delar med dig.',
      'Jag hör att du känner dig nyfiken. Nyfikenhet är viktigt.',
      'Nyfikenhet är en fin känsla. Tack för att du berättar.',
    ],
    angry: [
      'Det låter frustrerande. Tack för att du delar med dig.',
      'Jag hör att du känner dig arg. Det är okej att känna så.',
      'Ilska är en naturlig känsla. Tack för att du delar den med mig.',
    ],
  };

  const emotionReplies = baseReplies[emotion] || [
    'Tack för att du berättar hur du känner dig.',
  ];
  const baseReply = emotionReplies[Math.floor(Math.random() * emotionReplies.length)];

  const trimmed = note && note.trim();
  const len = trimmed ? trimmed.length : 0;

  // Ingen text – känslosvar + kort avslutande mening så det känns mer reflekterande
  if (len === 0) {
    const noNoteExtras = [
      'Det betyder mycket att du berättar.',
      'Jag lyssnar.',
      'Bra att du delar med dig.',
    ];
    const extra = noNoteExtras[Math.floor(Math.random() * noNoteExtras.length)];
    return `${baseReply} ${extra}`;
  }

  const theme = detectTheme(trimmed);
  const quote = trimmed.replace(/["""]+/g, "'");
  const shortQuote = quote.slice(0, 60);
  const mediumQuote = quote.slice(0, 80);

  // Kort text (t.ex. en mening): känsla + kort citat
  if (len <= NOTE_SHORT) {
    const ref = theme
      ? theme.replies[Math.floor(Math.random() * theme.replies.length)]
      : baseReply;
    return `${ref} Jag hör: "${shortQuote}${quote.length > 60 ? '…' : ''}"`;
  }

  // Medellång: känsla + reflekterande rad (nyckelord om det finns) + kort citat
  if (len <= NOTE_MEDIUM) {
    const reflective = theme
      ? theme.replies[Math.floor(Math.random() * theme.replies.length)]
      : baseReply;
    return `${reflective} Jag hör: "${mediumQuote}${quote.length > 80 ? '…' : ''}"`;
  }

  // Lång text: reflekterande svar utan långt citat (de har redan berättat mycket)
  const longAcks = [
    'Tack för att du delade med dig av så mycket.',
    'Det betyder mycket att du berättar. Jag lyssnar.',
    'Tack för att du tog dig tid att berätta.',
  ];
  const longAck = longAcks[Math.floor(Math.random() * longAcks.length)];
  if (theme) {
    const themeLine = theme.replies[Math.floor(Math.random() * theme.replies.length)];
    return `${themeLine} ${longAck}`;
  }
  return `${baseReply} ${longAck}`;
}

/**
 * POST /api/listen
 * 
 * Accepts: { emotion: string, note?: string }
 * Returns: { reply: string }
 * 
 * Rules:
 * - emotion must be one of: happy/calm/tired/sad/curious/angry
 * - note is optional, max 240 chars, sanitized
 * - Rate limited: 20 requests per minute per IP
 * - Returns reflective, non-advisory reply in Swedish
 */
listen.post('/listen', (req, res) => {
  try {
    // Rate limiting (by IP)
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: 'För många förfrågningar. Vänta lite och försök igen.',
      });
    }

    // Validate request body
    const { emotion, note } = req.body || {};

    // Validate emotion
    if (!emotion || typeof emotion !== 'string') {
      return res.status(400).json({
        error: 'emotion_required',
        message: 'Känsla krävs.',
      });
    }

    if (!VALID_EMOTIONS.includes(emotion)) {
      return res.status(400).json({
        error: 'invalid_emotion',
        message: `Känsla måste vara en av: ${VALID_EMOTIONS.join(', ')}`,
      });
    }

    // Sanitize note (optional)
    const sanitizedNote = note ? sanitizeNote(note) : '';

    // Generate reply
    const reply = generateReply(emotion, sanitizedNote);

    // Return reply
    res.json({ reply });
  } catch (err) {
    console.error('[POST /api/listen] Error:', err);
    res.status(500).json({
      error: 'server_error',
      message: 'Något gick fel. Försök igen senare.',
    });
  }
});
