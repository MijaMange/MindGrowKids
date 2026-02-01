import mongoose from 'mongoose';
import { col } from './_collections.js';

const AvatarSchema = new mongoose.Schema({
  childRef: { type: mongoose.Types.ObjectId, ref: 'Child', unique: true },
  data: { type: Object, default: {} }, // lagrar avatar-objektet
});

export const Avatar = mongoose.models.Avatar || mongoose.model('Avatar', AvatarSchema, col('avatars'));

