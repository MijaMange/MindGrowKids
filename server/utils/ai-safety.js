/**
 * AI Safety Utilities for MindGrow Kids
 * 
 * Provides input sanitization, output validation, and rate limiting
 * for AI-related endpoints.
 */

// Forbidden advice patterns (Swedish)
const FORBIDDEN_PATTERNS = [
  /du borde/i,
  /du bör/i,
  /gör så här/i,
  /jag rekommenderar/i,
  /jag föreslår/i,
  /du ska/i,
  /du måste/i,
  /du behöver/i,
  /bör du/i,
  /skulle du/i,
  /rekommenderar att/i,
  /föreslår att/i,
  /råd/i, // "råd" (advice)
  /råda/i, // "råda" (to advise)
];

// Max lengths for prompts
const MAX_PROMPT_LENGTH = 2000;
const MAX_SYSTEM_PROMPT_LENGTH = 500;

/**
 * Sanitize input to ensure only aggregated data is sent
 * @param {object} aggregation - Aggregated checkin data
 * @returns {string} - Sanitized prompt text
 */
export function sanitizeInput(aggregation) {
  const { buckets, total, timeSeries } = aggregation;

  // Ensure we only send counts, not raw text
  const safeBuckets = {};
  for (const [emotion, count] of Object.entries(buckets || {})) {
    if (typeof count === 'number' && count >= 0) {
      safeBuckets[emotion] = count;
    }
  }

  // Only include time series counts, not raw data
  const safeTimeSeries = (timeSeries || []).map((ts) => ({
    date: ts.date || '',
    buckets: Object.fromEntries(
      Object.entries(ts.buckets || {}).map(([emotion, count]) => [
        emotion,
        typeof count === 'number' && count >= 0 ? count : 0,
      ])
    ),
  }));

  // Build prompt with only aggregated data
  const prompt = `Totalt ${total || 0} registreringar. Fördelning: ${JSON.stringify(safeBuckets)}. Tidslinje: ${safeTimeSeries.length} dagar.`;

  // Enforce max length
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return prompt.substring(0, MAX_PROMPT_LENGTH);
  }

  return prompt;
}

/**
 * Sanitize system prompt
 * @param {string} systemPrompt - System prompt text
 * @returns {string} - Sanitized system prompt
 */
export function sanitizeSystemPrompt(systemPrompt) {
  if (!systemPrompt || typeof systemPrompt !== 'string') {
    return '';
  }

  // Enforce max length
  if (systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
    return systemPrompt.substring(0, MAX_SYSTEM_PROMPT_LENGTH);
  }

  return systemPrompt;
}

/**
 * Validate AI output for forbidden advice patterns
 * @param {string} text - AI response text
 * @returns {boolean} - true if safe, false if contains advice
 */
export function validateOutput(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      return false;
    }
  }

  return true;
}

/**
 * Simple in-memory rate limiter
 */
class RateLimiter {
  constructor() {
    this.requests = new Map(); // userId -> { count, resetAt }
    this.WINDOW_MS = 60 * 1000; // 1 minute
    this.MAX_REQUESTS = 10; // 10 requests per minute
  }

  /**
   * Check if request is allowed
   * @param {string} userId - User ID
   * @returns {boolean} - true if allowed, false if rate limited
   */
  isAllowed(userId) {
    const now = Date.now();
    const record = this.requests.get(userId);

    if (!record || now > record.resetAt) {
      // New window
      this.requests.set(userId, {
        count: 1,
        resetAt: now + this.WINDOW_MS,
      });
      return true;
    }

    if (record.count >= this.MAX_REQUESTS) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Get remaining requests in current window
   * @param {string} userId - User ID
   * @returns {number} - Remaining requests
   */
  getRemaining(userId) {
    const now = Date.now();
    const record = this.requests.get(userId);

    if (!record || now > record.resetAt) {
      return this.MAX_REQUESTS;
    }

    return Math.max(0, this.MAX_REQUESTS - record.count);
  }

  /**
   * Clean up old entries (call periodically)
   */
  cleanup() {
    const now = Date.now();
    for (const [userId, record] of this.requests.entries()) {
      if (now > record.resetAt) {
        this.requests.delete(userId);
      }
    }
  }
}

// Singleton rate limiter instance
export const rateLimiter = new RateLimiter();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Safe logging (development only)
 * @param {string} prompt - User prompt (sanitized)
 * @param {string} response - AI response
 * @param {string} endpoint - Endpoint name
 */
export function safeLog(prompt, response, endpoint = 'ai') {
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'prod') {
    console.log(`[AI-SAFETY] ${endpoint}:`);
    console.log(`  Prompt: ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}`);
    console.log(`  Response: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`);
    console.log(`  Validated: ${validateOutput(response)}`);
  }
}
