# AI Safety Guidelines for MindGrow Kids

## Overview

This document outlines the safety guardrails implemented for AI-related endpoints in MindGrow Kids. The goal is to ensure AI responses are safe, appropriate, and never provide direct advice to children or adults.

## Tone Rules

### Allowed Tone
- **Descriptive**: "Under denna period registrerades flera känslouttryck..."
- **Observational**: "Glädje var den vanligaste känslan..."
- **Neutral**: "Mönstret visar variation över tid..."

### Forbidden Tone
- **Directive**: "Du borde...", "Gör så här..."
- **Advisory**: "Jag rekommenderar...", "Jag föreslår..."
- **Prescriptive**: "Du ska...", "Du måste..."
- **Judgmental**: "Detta är bra/dåligt..."

## Forbidden Content Patterns

The following patterns are automatically detected and rejected:

- `du borde` / `du bör` (you should)
- `gör så här` (do this)
- `jag rekommenderar` (I recommend)
- `jag föreslår` (I suggest)
- `du ska` (you shall)
- `du måste` (you must)
- `du behöver` (you need)
- `bör du` (should you)
- `skulle du` (would you)
- `rekommenderar att` (recommend that)
- `föreslår att` (suggest that)
- `råd` / `råda` (advice / to advise)

## Input Sanitization

### Aggregated Data Only
- **Never send raw child text** (notes, drawings, etc.)
- **Only send counts**: emotion counts, totals, time series counts
- **No personal identifiers**: names, IDs, or any identifying information

### Max Length Limits
- **User prompt**: Max 2000 characters
- **System prompt**: Max 500 characters
- Prompts exceeding limits are truncated

### Example Safe Input
```json
{
  "total": 15,
  "buckets": {
    "happy": 8,
    "calm": 4,
    "tired": 3
  },
  "timeSeries": [
    {
      "date": "2024-01-15",
      "buckets": {
        "happy": 3,
        "calm": 2
      }
    }
  ]
}
```

## Output Validation

### Validation Process
1. AI response is received
2. Response is checked against forbidden patterns
3. If pattern detected → **rejected**, fallback to `gentleSummary()`
4. If safe → **accepted** and returned

### Fallback Strategy
When AI output is rejected:
- Use `gentleSummary()` function (non-AI, rule-based)
- Provides safe, descriptive text based on aggregated data
- Example: "Under denna period registrerades 15 känslouttryck. Den vanligaste känslan var glädje (53% av registreringarna)."

## Rate Limiting

### Limits
- **10 requests per minute** per user
- **1-minute window** (sliding window)
- **In-memory storage** (resets on server restart)

### Response
When rate limit exceeded:
```json
{
  "error": "rate_limit_exceeded",
  "message": "För många förfrågningar. Försök igen om en minut.",
  "retryAfter": 60
}
```

## Safe Logging

### Development Only
- Logs are **only enabled in development** (`NODE_ENV !== 'production'`)
- Logs include:
  - Sanitized prompt (first 200 chars)
  - AI response (first 200 chars)
  - Validation result (passed/rejected)

### No Personal Data
- **Never logs**:
  - Child names
  - Personal identifiers
  - Raw notes or text
  - User IDs (only endpoint name)

### Example Log
```
[AI-SAFETY] analytics/summary:
  Prompt: Totalt 15 registreringar. Fördelning: {"happy":8,"calm":4}...
  Response: Under denna period registrerades flera känslouttryck...
  Validated: true
```

## Child AI Companion Endpoint

### POST /api/listen

**Purpose:** Provides reflective, non-advisory replies to children when they express emotions.

**Rules:**
- **Reflective only**: Acknowledges the emotion without giving advice
- **Non-advisory**: No instructions, no "you should", no recommendations
- **Short replies**: 1-2 sentences maximum
- **Calm and supportive**: Validates feelings without judgment
- **Swedish language**: All replies in Swedish

**Input:**
```json
{
  "emotion": "happy" | "calm" | "tired" | "sad" | "curious" | "angry",
  "note": "optional text note (max 240 chars)"
}
```

**Output:**
```json
{
  "reply": "Det låter glatt. Tack för att du delar med dig."
}
```

**Safety Measures:**
1. **Input validation**: Emotion must be one of the 6 valid emotions
2. **Note sanitization**: 
   - Max 240 characters
   - HTML tags stripped
   - Control characters removed
   - Quotes normalized
3. **Rate limiting**: 20 requests per minute per IP (in-memory)
4. **Static templates**: Uses deterministic reply templates (no AI model calls)
5. **No advice patterns**: All replies are pre-written and validated to be non-advisory

**Example Replies:**
- Happy: "Det låter glatt. Tack för att du delar med dig."
- Sad: "Det låter tungt. Tack för att du delar med dig."
- With note: "Det låter glatt. Tack för att du delar med dig. Jag hör: \"Jag är glad idag\""

**Rate Limiting:**
- **20 requests per minute** per IP
- **1-minute window** (sliding window)
- **In-memory storage** (resets on server restart)

**Future Enhancements:**
- [ ] Optional OpenAI integration with strict output validation
- [ ] Per-user rate limiting (requires authentication)
- [ ] Reply personalization based on child's history (non-identifying)

## Implementation Details

### Files
- `server/utils/ai-safety.js` - Core safety utilities
- `server/routes/analytics.js` - AI summary endpoint (protected)
- `server/routes/listen.js` - Child AI companion endpoint (public, rate-limited)

### Functions
- `sanitizeInput(aggregation)` - Sanitizes input to aggregated data only
- `sanitizeSystemPrompt(prompt)` - Sanitizes system prompt
- `validateOutput(text)` - Validates AI output for forbidden patterns
- `rateLimiter.isAllowed(userId)` - Checks rate limit
- `safeLog(prompt, response, endpoint)` - Safe logging (dev only)

## Best Practices

1. **Always use aggregated data** - Never send raw child text to AI
2. **Validate all outputs** - Check for advice patterns before returning
3. **Have fallbacks** - Always provide non-AI fallback (`gentleSummary()`)
4. **Rate limit** - Prevent abuse and excessive API costs
5. **Log safely** - Only in development, never personal data

## Future Enhancements

- [ ] Content moderation API integration
- [ ] Sentiment analysis for additional safety checks
- [ ] Persistent rate limiting (Redis/database)
- [ ] Per-endpoint rate limits
- [ ] Admin dashboard for monitoring AI usage
