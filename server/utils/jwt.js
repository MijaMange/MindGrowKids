import jwt from 'jsonwebtoken';

export function createJWT(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret || String(secret).trim().length === 0) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function verifyJWT(token) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || String(secret).trim().length === 0) {
      console.error('[JWT] JWT_SECRET is not set');
      return null;
    }
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

