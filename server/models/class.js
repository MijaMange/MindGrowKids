import mongoose from 'mongoose';
import { col } from './_collections.js';

const ClassSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: String,
    ownerUserId: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
export const ClassModel = mongoose.models.Class || mongoose.model('Class', ClassSchema, col('classes'));
