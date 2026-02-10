import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createJWT, verifyJWT } from '../utils/jwt.js';
import { setAuthCookie } from '../mw/auth.js';
import { Kid, ParentUser, ProUser } from '../models/mongo.js';
import mongoose from 'mongoose';
import { readFileDB, writeFileDB } from '../lib/db.js';
import { randomUUID } from 'crypto';

export const auth = Router();

function isMongoConnected() {
  return !!(mongoose.connection && mongoose.connection.readyState === 1);
}

// Vuxen: registrera (parent|pro)
auth.post('/auth/register', async (req, res) => {
  try {
    // Kontrollera JWT_SECRET innan vi fortsätter
    if (!process.env.JWT_SECRET || String(process.env.JWT_SECRET).trim().length === 0) {
      console.error('[AUTH] Missing JWT_SECRET - kontrollera .env-filen');
      console.error('[AUTH] process.env.JWT_SECRET:', process.env.JWT_SECRET);
      return res.status(500).json({ error: 'registration_failed', message: 'Server saknar JWT_SECRET. Kontrollera .env-filen.' });
    }

    console.log('[POST /auth/register] Body:', { ...req.body, password: '***' });
    const { email, password, role, name, classCode: rawClassCode, dateOfBirth } = req.body || {};
    const classCode = (rawClassCode && String(rawClassCode).trim().toUpperCase()) || '';
    if (!email) {
      return res.status(400).json({ error: 'email_required' });
    }
    if (!['child', 'parent', 'pro'].includes(role)) {
      return res.status(400).json({ error: 'role_invalid' });
    }
    
    // All roles require password for unified login
    if (!password) {
      return res.status(400).json({ error: 'password_required' });
    }
    
    const hash = await bcrypt.hash(password, 10);

  if (role === 'child') {
    // Child registration - now with password for unified login
    if (isMongoConnected()) {
      const { Kid } = await import('../models/mongo.js');
      // Check if child with same email exists
      const exists = await Kid.findOne({ email });
      if (exists) {
        return res.status(409).json({ error: 'email_exists', message: 'Detta användarnamn finns redan.' });
      }
      const u = await Kid.create({
        name: name || email,
        classCode: classCode || '',
        email: email,
        passwordHash: hash,
      });
      const token = createJWT({ id: u._id.toString(), role: 'child' });
      setAuthCookie(res, token);
      return res.json({ ok: true, role: 'child', name: u.name, classCode: u.classCode });
    }
    // FILE fallback
    const db = readFileDB();
    const existingChild = (db.kids || []).find((k) => k.email === email);
    if (existingChild) {
      return res.status(409).json({ error: 'email_exists', message: 'Detta användarnamn finns redan.' });
    }
    const u = {
      id: randomUUID(),
      name: name || email,
      classCode: classCode || '',
      email: email,
      passwordHash: hash,
      dateOfBirth: dateOfBirth || null,
    };
    db.kids = db.kids || [];
    db.kids.push(u);
    writeFileDB(db);
    const token = createJWT({ id: u.id, role: 'child' });
    setAuthCookie(res, token);
    return res.json({ ok: true, role: 'child', name: u.name, classCode: u.classCode });
  } else if (role === 'parent') {
    if (isMongoConnected()) {
      const exists = await ParentUser.findOne({ email });
      if (exists) return res.status(409).json({ error: 'email_exists' });
      const u = await ParentUser.create({ email, passwordHash: hash, name, role: 'parent' });
      const token = createJWT({ id: u._id.toString(), role: 'parent', email });
      setAuthCookie(res, token);
      return res.json({ ok: true, role: 'parent', name: u.name });
    }
    // FILE fallback
    const db = readFileDB();
    if (db.parents?.find((p) => p.email === email)) {
      return res.status(409).json({ error: 'email_exists' });
    }
    const u = {
      id: randomUUID(),
      email,
      passwordHash: hash,
      name,
      role: 'parent',
    };
    db.parents = db.parents || [];
    db.parents.push(u);
    writeFileDB(db);
    const token = createJWT({ id: u.id, role: 'parent', email });
    setAuthCookie(res, token);
    return res.json({ ok: true, role: 'parent', name: u.name });
  } else {
    // pro
    if (isMongoConnected()) {
      const exists = await ProUser.findOne({ email });
      if (exists) return res.status(409).json({ error: 'email_exists' });
      const u = await ProUser.create({
        email,
        passwordHash: hash,
        name,
        role: 'pro',
        classCode: classCode || 'C-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      });
      const token = createJWT({ id: u._id.toString(), role: 'pro' });
      setAuthCookie(res, token);
      return res.json({ ok: true, role: 'pro', name: u.name, classCode: u.classCode });
    }
    // FILE fallback
    const db = readFileDB();
    if (db.professionals?.find((p) => p.email === email)) {
      return res.status(409).json({ error: 'email_exists' });
    }
    const u = {
      id: randomUUID(),
      email,
      passwordHash: hash,
      name,
      role: 'pro',
      classCode: classCode || 'C-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    };
    db.professionals = db.professionals || [];
    db.professionals.push(u);
    writeFileDB(db);
    const token = createJWT({ id: u.id, role: 'pro' });
    setAuthCookie(res, token);
    return res.json({ ok: true, role: 'pro', name: u.name, classCode: u.classCode });
  }
  } catch (err) {
    console.error('[POST /auth/register] Error:', err);
    console.error('[POST /auth/register] Stack:', err instanceof Error ? err.stack : 'No stack');
    // Se till att vi alltid returnerar JSON även vid fel
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'registration_failed', 
        message: err instanceof Error ? err.message : 'Okänt fel',
        details: import.meta.env?.DEV ? (err instanceof Error ? err.stack : String(err)) : undefined
      });
    } else {
      // Om headers redan skickats, logga bara
      console.error('[POST /auth/register] Headers already sent, cannot send error response');
    }
  }
});

// Vuxen: login
auth.post('/auth/login', async (req, res) => {
  try {
    // Kontrollera JWT_SECRET innan vi fortsätter
    if (!process.env.JWT_SECRET || String(process.env.JWT_SECRET).trim().length === 0) {
      console.error('[AUTH] Missing JWT_SECRET - kontrollera .env-filen');
      console.error('[AUTH] process.env.JWT_SECRET:', process.env.JWT_SECRET);
      return res.status(500).json({ error: 'login_failed', message: 'Server saknar JWT_SECRET. Kontrollera .env-filen.' });
    }

    const { email, password } = req.body || {};
    console.log('[AUTH] Login attempt:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return res.status(400).json({ error: 'email_and_password_required', message: 'E-post och lösenord krävs' });
    }
    
    // Search in all user types: parents, professionals, and children
    let u = null;
    let role = 'parent';

    if (isMongoConnected()) {
      console.log('[AUTH] Using MongoDB');
      u = await ParentUser.findOne({ email });
      if (!u) {
        u = await ProUser.findOne({ email });
        role = u ? 'pro' : 'parent';
      }
      if (!u) {
        const { Kid } = await import('../models/mongo.js');
        u = await Kid.findOne({ email });
        role = u ? 'child' : 'parent';
      }
    } else {
      // FILE fallback
      console.log('[AUTH] Using file-based storage');
      const db = readFileDB();
      u = db.parents?.find((p) => p.email === email);
      if (!u) {
        u = db.professionals?.find((p) => p.email === email);
        role = u ? 'pro' : 'parent';
      }
      if (!u) {
        u = db.kids?.find((k) => k.email === email);
        role = u ? 'child' : 'parent';
      }
      console.log('[AUTH] Found user:', u ? { email: u.email, role, hasPasswordHash: !!u.passwordHash } : 'none');
    }

    if (!u) {
      console.log('[AUTH] User not found:', email);
      return res.status(401).json({ error: 'no_user', message: 'Ingen användare hittades med denna e-post. Registrera dig först.' });
    }
    
    if (!u.passwordHash) {
      console.error('[AUTH] User has no password hash:', email);
      return res.status(500).json({ error: 'invalid_user', message: 'Användaren saknar lösenord. Kontakta support.' });
    }
    
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) {
      console.log('[AUTH] Password mismatch for:', email);
      return res.status(401).json({ error: 'bad_pass', message: 'Fel lösenord.' });
    }

    const userId = isMongoConnected() ? u._id.toString() : u.id;
    const token = createJWT({ id: userId, role, email: u.email || email });
    setAuthCookie(res, token);
    console.log('[AUTH] Login success:', { email, role, userId });
    res.json({
      ok: true,
      role,
      name: u.name,
      classCode: u.classCode || '',
      id: userId, // Include user ID in response
    });
  } catch (err) {
    console.error('[POST /auth/login] Error:', err);
    // Se till att vi alltid returnerar JSON även vid fel
    if (!res.headersSent) {
      res.status(500).json({ error: 'login_failed', message: err.message || 'Okänt fel' });
    }
  }
});

// Barn: login (namn + klasskod)
auth.post('/auth/child-login', async (req, res) => {
  try {
    // Sätt Content-Type direkt
    res.setHeader('Content-Type', 'application/json');
    
    // Logga request info för debugging
    console.log('[AUTH] Child login request:', {
      origin: req.headers.origin,
      host: req.headers.host,
      method: req.method,
      body: req.body ? { name: req.body.name, classCode: req.body.classCode ? '***' : undefined } : 'no body',
    });
    
    // Kontrollera JWT_SECRET innan vi fortsätter
    if (!process.env.JWT_SECRET || String(process.env.JWT_SECRET).trim().length === 0) {
      console.error('[AUTH] Missing JWT_SECRET - kontrollera .env-filen');
      console.error('[AUTH] process.env.JWT_SECRET:', process.env.JWT_SECRET);
      return res.status(500).json({ error: 'child_login_failed', message: 'Server saknar JWT_SECRET. Kontrollera .env-filen.' });
    }

    const { name, classCode } = req.body || {};
    console.log('[AUTH] Child login attempt:', { name, classCode: classCode ? '***' : undefined });
    
    if (!name || !classCode) {
      console.log('[AUTH] Missing fields:', { hasName: !!name, hasClassCode: !!classCode });
      return res.status(400).json({ error: 'missing_fields', message: 'Namn och klasskod krävs' });
    }

    if (isMongoConnected()) {
      let kid = await Kid.findOne({ name, classCode });
      if (!kid) {
        // Generera permanent länkkod (6-siffrig)
        const linkCode = String(Math.floor(100000 + Math.random() * 900000));
        kid = await Kid.create({ name, classCode, linkCode });
        console.log('[AUTH] Created new kid:', kid._id.toString(), 'linkCode:', linkCode);
      } else if (!kid.linkCode) {
        // Om barnet saknar länkkod, generera en
        const linkCode = String(Math.floor(100000 + Math.random() * 900000));
        kid.linkCode = linkCode;
        await kid.save();
        console.log('[AUTH] Generated linkCode for existing kid:', kid._id.toString(), 'linkCode:', linkCode);
      }
      const token = createJWT({ id: kid._id.toString(), role: 'child' });
      setAuthCookie(res, token);
      console.log('[AUTH] Child login success (mongo):', { name: kid.name, classCode, id: kid._id.toString() });
      return res.json({ ok: true, role: 'child', name: kid.name, classCode });
    }

    // FILE fallback
    const db = readFileDB();
    let kid = db.kids?.find((k) => k.name === name && k.classCode === classCode);
    if (!kid) {
      // Generera permanent länkkod (6-siffrig, lätt att komma ihåg)
      const linkCode = String(Math.floor(100000 + Math.random() * 900000));
      kid = { id: randomUUID(), name, classCode, linkCode };
      db.kids = db.kids || [];
      db.kids.push(kid);
      writeFileDB(db);
      console.log('[AUTH] Created new kid (file):', kid.id, 'linkCode:', linkCode);
    } else if (!kid.linkCode) {
      // Om barnet saknar länkkod, generera en
      const linkCode = String(Math.floor(100000 + Math.random() * 900000));
      kid.linkCode = linkCode;
      const kidIndex = db.kids.findIndex((k) => k.id === kid.id);
      if (kidIndex > -1) {
        db.kids[kidIndex] = kid;
        writeFileDB(db);
        console.log('[AUTH] Generated linkCode for existing kid:', kid.id, 'linkCode:', linkCode);
      }
    }
    const token = createJWT({ id: kid.id, role: 'child' });
    setAuthCookie(res, token);
    return res.json({ ok: true, role: 'child', name: kid.name, classCode });
  } catch (err) {
    console.error('[POST /auth/child-login] Error:', err);
    // Se till att vi alltid returnerar JSON även vid fel
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ error: 'child_login_failed', message: err.message || 'Okänt fel' });
    }
  }
});

// Logout
auth.post('/auth/logout', (req, res) => {
  const crossSite = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    sameSite: crossSite ? 'none' : 'lax',
    secure: crossSite ? true : false,
  });
  res.json({ ok: true });
});

// Sessionstatus (returnerar role + id så klienten kan återställa session)
auth.get('/auth/me', (req, res) => {
  const t = req.cookies?.token;
  if (!t) return res.status(401).json({ ok: false });
  try {
    const data = verifyJWT(t);
    if (!data) return res.status(401).json({ ok: false });
    return res.json({ ok: true, role: data.role, id: data.id });
  } catch {
    return res.status(401).json({ ok: false });
  }
});
