import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

export const useCookies = cookieParser();

export function authRequired(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'missing_token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}

export function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'no_user' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

export function setAuthCookie(res, token) {
  const crossSite = process.env.NODE_ENV === 'production'; // vi antar prod = cross-site
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'lax',
    secure: crossSite ? true : false,
    maxAge: 7 * 24 * 3600 * 1000,
  });
}
