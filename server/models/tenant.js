import mongoose from 'mongoose';
import { col } from './_collections.js';

// Org – organisation (för framtida multi-tenant)
const OrgSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    name: String,
  },
  { timestamps: true }
);

// Class – klass/grupp
const ClassSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: String,
    orgId: { type: mongoose.Types.ObjectId, ref: 'Org', required: true },
  },
  { timestamps: true }
);

// Student – elev/barn
const StudentSchema = new mongoose.Schema(
  {
    displayName: String,
    classId: { type: mongoose.Types.ObjectId, ref: 'Class', required: true },
    orgId: { type: mongoose.Types.ObjectId, ref: 'Org', required: true },
    childRef: { type: mongoose.Types.ObjectId, ref: 'Child', required: true },
  },
  { timestamps: true }
);

// Checkin – känsloregistrering
const CheckinSchema = new mongoose.Schema({
  orgId: { type: mongoose.Types.ObjectId, ref: 'Org', required: true },
  classId: { type: mongoose.Types.ObjectId, ref: 'Class', required: true },
  studentId: { type: mongoose.Types.ObjectId, ref: 'Student', required: true },
  emotion: {
    type: String,
    enum: ['happy', 'calm', 'tired', 'sad', 'curious', 'angry'],
    required: true,
  },
  mode: { type: String, enum: ['text', 'draw'], required: true },
  note: String,
  drawingRef: String,
  dateISO: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  clientId: String, // Client-generated ID for duplicate detection (optional, unique per studentId)
});

// Index for duplicate detection (clientId + studentId should be unique)
CheckinSchema.index({ clientId: 1, studentId: 1 }, { unique: true, sparse: true });

export const Org = mongoose.models.Org || mongoose.model('Org', OrgSchema, col('orgs'));
export const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema, col('classes'));
export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema, col('students'));
export const Checkin = mongoose.models.Checkin || mongoose.model('Checkin', CheckinSchema, col('checkins'));

