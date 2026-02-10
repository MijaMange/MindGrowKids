# POST /api/listen Endpoint

## Overview

The `/api/listen` endpoint provides reflective, non-advisory replies to children when they express emotions. This is the AI companion feature that responds to child checkins.

## Endpoint Details

**URL:** `POST /api/listen`  
**Authentication:** None (public endpoint, rate-limited by IP)  
**Content-Type:** `application/json`

## Request

### Body
```json
{
  "emotion": "happy" | "calm" | "tired" | "sad" | "curious" | "angry",
  "note": "optional text note (max 240 chars)"
}
```

### Validation
- `emotion` (required): Must be one of: `happy`, `calm`, `tired`, `sad`, `curious`, `angry`
- `note` (optional): Max 240 characters, HTML tags and control characters are stripped

## Response

### Success (200 OK)
```json
{
  "reply": "Det låter glatt. Tack för att du delar med dig."
}
```

### Error Responses

**400 Bad Request** - Invalid emotion
```json
{
  "error": "invalid_emotion",
  "message": "Känsla måste vara en av: happy, calm, tired, sad, curious, angry"
}
```

**400 Bad Request** - Missing emotion
```json
{
  "error": "emotion_required",
  "message": "Känsla krävs."
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": "rate_limit_exceeded",
  "message": "För många förfrågningar. Vänta lite och försök igen."
}
```

**500 Internal Server Error**
```json
{
  "error": "server_error",
  "message": "Något gick fel. Försök igen senare."
}
```

## Rate Limiting

- **Limit:** 20 requests per minute per IP
- **Window:** 1 minute (sliding window)
- **Storage:** In-memory (resets on server restart)

## Example Requests

### cURL Examples

**Basic request (emotion only):**
```bash
curl -X POST http://localhost:4000/api/listen \
  -H "Content-Type: application/json" \
  -d '{"emotion": "happy"}'
```

**Request with note:**
```bash
curl -X POST http://localhost:4000/api/listen \
  -H "Content-Type: application/json" \
  -d '{"emotion": "sad", "note": "Jag saknar min kompis"}'
```

**Invalid emotion:**
```bash
curl -X POST http://localhost:4000/api/listen \
  -H "Content-Type: application/json" \
  -d '{"emotion": "excited"}'
```

### JavaScript/Fetch Example

```javascript
const response = await fetch('/api/listen', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emotion: 'happy',
    note: 'Jag är glad idag!'
  })
});

const data = await response.json();
console.log(data.reply); // "Det låter glatt. Tack för att du delar med dig. Jag hör: \"Jag är glad idag\""
```

## Reply Generation

The endpoint uses static, pre-written reply templates that are:
- **Reflective**: Acknowledge the emotion
- **Non-advisory**: No instructions or advice
- **Short**: 1-2 sentences
- **Calm and supportive**: Validates feelings without judgment
- **Swedish**: All replies in Swedish

### Reply Examples by Emotion

**Happy:**
- "Det låter glatt. Tack för att du delar med dig."
- "Jag hör att du känner dig glad. Det är fint att du berättar."

**Sad:**
- "Det låter tungt. Tack för att du delar med dig."
- "Jag hör att du känner dig ledsen. Det är okej att känna så."

**Angry:**
- "Det låter frustrerande. Tack för att du delar med dig."
- "Jag hör att du känner dig arg. Det är okej att känna så."

**With note:**
- Base reply + "Jag hör: \"[note excerpt]\""
- Sometimes (30% chance) adds: "Vill du berätta lite mer?"

## Safety Features

1. **Input validation**: Only valid emotions accepted
2. **Note sanitization**: HTML tags, control characters removed, length limited
3. **Rate limiting**: Prevents abuse
4. **Static templates**: No AI model calls (deterministic, safe replies)
5. **Non-advisory**: All replies pre-validated to avoid advice patterns

## Implementation Files

- `server/routes/listen.js` - Route implementation
- `server/index.js` - Route registration
- `docs/ai-safety.md` - Safety documentation

## Future Enhancements

- [ ] Optional OpenAI integration with strict output validation
- [ ] Per-user rate limiting (requires authentication)
- [ ] Reply personalization based on child's history (non-identifying)
- [ ] Persistent rate limiting (Redis/database)
