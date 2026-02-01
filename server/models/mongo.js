import mongoose from 'mongoose';
import { col } from './_collections.js';

const opts = { timestamps: true };

const KidSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, sparse: true }, // For unified login
    passwordHash: String, // For unified login
    classCode: String, // koppling till klass
    orgId: String, // om ni använder org-scope
    linkCode: String, // permanent länkkod för föräldrar (6-siffrig)
  },
  opts
);

const ParentSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    passwordHash: String,
    name: String,
    role: { type: String, default: 'parent' },
    childId: String, // länk till barn via ID eller länkkod
  },
  opts
);

const ProSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    passwordHash: String,
    name: String,
    role: { type: String, default: 'pro' },
    classCode: String, // klasskod som läraren äger
    orgId: String,
  },
  opts
);

const CheckinSchema = new mongoose.Schema({
  orgId: String,
  classId: String,
  studentId: String, // kid._id.toString()
  emotion: String, // "happy" | ...
  mode: String, // "text" | "voice" | "draw"
  note: String,
  drawingRef: String,
  dateISO: String,
  createdAtISO: { type: String, default: () => new Date().toISOString() },
}, { timestamps: false });

const MoodSchema = new mongoose.Schema(
  {
    childRef: { type: mongoose.Types.ObjectId, ref: 'Kid', unique: true },
    values: {
      love: { type: Number, default: 50 },
      joy: { type: Number, default: 50 },
      calm: { type: Number, default: 50 },
      energy: { type: Number, default: 50 },
      sadness: { type: Number, default: 50 },
      anger: { type: Number, default: 50 },
    },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
  },
  opts
);

const AvatarSchema = new mongoose.Schema(
  {
    childRef: { type: mongoose.Types.ObjectId, ref: 'Kid', unique: true },
    data: { type: Object, default: {} },
  },
  opts
);

const ClassSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: String,
    ownerUserId: { type: mongoose.Types.ObjectId, ref: 'Pro' },
    orgId: String,
  },
  opts
);

export const Kid = mongoose.models.Kid || mongoose.model('Kid', KidSchema, col('kids'));
export const ParentUser = mongoose.models.ParentUser || mongoose.model('ParentUser', ParentSchema, col('parents'));
export const ProUser = mongoose.models.ProUser || mongoose.model('ProUser', ProSchema, col('professionals'));
export const Checkin = mongoose.models.Checkin || mongoose.model('Checkin', CheckinSchema, col('checkins'));
export const Mood = mongoose.models.Mood || mongoose.model('Mood', MoodSchema, col('moods'));
export const Avatar = mongoose.models.Avatar || mongoose.model('Avatar', AvatarSchema, col('avatars'));
export const ClassModel = mongoose.models.ClassModel || mongoose.model('ClassModel', ClassSchema, col('classes'));
