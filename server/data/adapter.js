import mongoose from 'mongoose';
import { readFileDB, writeFileDB } from '../lib/db.js';
import { Org, Class, Student, Checkin } from '../models/tenant.js';

function isMongoConnected() {
  return !!(mongoose.connection && mongoose.connection.readyState === 1);
}

// Helper: get or create default org
export async function getDefaultOrg() {
  if (isMongoConnected()) {
    let org = await Org.findOne({ code: 'demo' });
    if (!org) {
      org = await Org.create({ code: 'demo', name: 'Demo Organisation' });
    }
    return org;
  }
  const db = readFileDB();
  let org = db.orgs?.find((o) => o.code === 'demo');
  if (!org) {
    org = { id: 'org-demo', code: 'demo', name: 'Demo Organisation' };
    db.orgs = db.orgs || [];
    db.orgs.push(org);
    writeFileDB(db);
  }
  return org;
}

// createCheckin({orgId,classId,studentId,emotion,mode,note?,drawingRef?,dateISO,clientId?})
export async function createCheckin({
  orgId,
  classId,
  studentId,
  emotion,
  mode,
  note,
  drawingRef,
  dateISO,
  clientId,
}) {
  const now = new Date().toISOString();
  const checkinData = {
    orgId,
    classId,
    studentId,
    emotion,
    mode,
    note: note || '',
    drawingRef: drawingRef || '',
    dateISO: dateISO || now,
    createdAt: now,
    clientId: clientId || undefined, // Optional clientId for duplicate detection
  };

  if (isMongoConnected()) {
    // Check for duplicate if clientId is provided
    if (clientId) {
      const existing = await Checkin.findOne({ clientId, studentId });
      if (existing) {
        // Return existing checkin to avoid duplicate
        return existing.toObject();
      }
    }
    const checkin = await Checkin.create(checkinData);
    return checkin.toObject();
  }

  // File-based DB: check for duplicates
  const db = readFileDB();
  db.checkins = db.checkins || [];
  
  if (clientId) {
    const existing = db.checkins.find((c) => c.clientId === clientId && c.studentId === studentId);
    if (existing) {
      // Return existing checkin to avoid duplicate
      return existing;
    }
  }
  
  const checkin = {
    id: `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...checkinData,
  };
  db.checkins.push(checkin);
  writeFileDB(db);
  return checkin;
}

// listCheckins({orgId,classId,from,to})
export async function listCheckins({ orgId, classId, from, to }) {
  const fromDate = from ? new Date(from) : new Date(Date.now() - 7 * 86400000);
  const toDate = to ? new Date(to) : new Date();

  if (isMongoConnected()) {
    const query = {
      orgId,
      classId,
      dateISO: { $gte: fromDate.toISOString(), $lte: toDate.toISOString() },
    };
    const rows = await Checkin.find(query).sort({ dateISO: 1 });
    return rows.map((r) => r.toObject());
  }

  const db = readFileDB();
  const rows = (db.checkins || []).filter((c) => {
    if (c.orgId !== orgId || c.classId !== classId) return false;
    const cDate = new Date(c.dateISO);
    return cDate >= fromDate && cDate <= toDate;
  });
  return rows.sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));
}

// summarize({orgId,classId,from,to}) -> { buckets:{emotion->count}, timeSeries:[{date, counts:{...}}], total }
export async function summarize({ orgId, classId, from, to }) {
  const rows = await listCheckins({ orgId, classId, from, to });

  const buckets = {};
  const timeSeriesMap = {};

  for (const row of rows) {
    const emotion = row.emotion || 'unknown';
    buckets[emotion] = (buckets[emotion] || 0) + 1;

    const date = row.dateISO.split('T')[0]; // YYYY-MM-DD
    if (!timeSeriesMap[date]) {
      timeSeriesMap[date] = {};
    }
    timeSeriesMap[date][emotion] = (timeSeriesMap[date][emotion] || 0) + 1;
  }

  const timeSeries = Object.entries(timeSeriesMap)
    .map(([date, counts]) => ({ date, buckets: counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    buckets,
    timeSeries,
    total: rows.length,
  };
}

// getStudentScope(user) -> {orgId,classId,studentId} (för barn)
export async function getStudentScope(user) {
  if (user.role !== 'child') {
    return { orgId: null, classId: null, studentId: null };
  }

  const defaultOrg = await getDefaultOrg();
  const orgId = isMongoConnected() ? defaultOrg._id.toString() : defaultOrg.id;

  if (isMongoConnected()) {
    const student = await Student.findOne({ childRef: user.id });
    if (!student) {
      return { orgId, classId: null, studentId: null };
    }
    return {
      orgId: student.orgId?.toString() || orgId,
      classId: student.classId?.toString() || null,
      studentId: student._id.toString(),
    };
  }

  const db = readFileDB();
  const student = db.students?.find((s) => s.childRef === user.id);
  if (!student) {
    return { orgId, classId: null, studentId: null };
  }
  return {
    orgId: student.orgId || orgId,
    classId: student.classId,
    studentId: student.id,
  };
}

// Helper: get or create class by code
export async function getOrCreateClass(code, orgId) {
  if (isMongoConnected()) {
    let cls = await Class.findOne({ code, orgId });
    if (!cls) {
      cls = await Class.create({ code, name: `Klass ${code}`, orgId });
    }
    return cls;
  }

  const db = readFileDB();
  let cls = db.classes?.find((c) => c.code === code && c.orgId === orgId);
  if (!cls) {
    cls = {
      id: `class-${Date.now()}`,
      code,
      name: `Klass ${code}`,
      orgId,
    };
    db.classes = db.classes || [];
    db.classes.push(cls);
    writeFileDB(db);
  }
  return cls;
}

// Helper: get or create student by name and classId
export async function getOrCreateStudent(name, classId, orgId, childRef) {
  if (isMongoConnected()) {
    let student = await Student.findOne({ childRef, classId });
    if (!student) {
      student = await Student.create({
        displayName: name,
        classId,
        orgId,
        childRef,
      });
    }
    return student;
  }

  const db = readFileDB();
  let student = db.students?.find((s) => s.childRef === childRef && s.classId === classId);
  if (!student) {
    student = {
      id: `student-${Date.now()}`,
      displayName: name,
      classId,
      orgId,
      childRef,
    };
    db.students = db.students || [];
    db.students.push(student);
    writeFileDB(db);
  }
  return student;
}

