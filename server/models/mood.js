import mongoose from 'mongoose';
import { col } from './_collections.js';

const MoodSchema = new mongoose.Schema({
  childRef: { type: mongoose.Types.ObjectId, ref: 'Child', unique: true },
  values: {
    love: { type: Number, default: 50 }, // ❤️ Kärlek/Connection
    joy: { type: Number, default: 50 }, // 🙂 Glädje
    calm: { type: Number, default: 50 }, // 🕊️ Lugn
    energy: { type: Number, default: 50 }, // ⚡ Energi
    sadness: { type: Number, default: 50 }, // 😢 Ledsen
    anger: { type: Number, default: 50 }, // 😠 Arg
  },
  lastUpdated: { type: String, default: () => new Date().toISOString() },
});

export const Mood = mongoose.models.Mood || mongoose.model('Mood', MoodSchema, col('moods'));

