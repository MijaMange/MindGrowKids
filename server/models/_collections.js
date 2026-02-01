/**
 * Central mapping av collection-namn från environment variables
 * Med fallback till standardnamn om env-variabler saknas
 */
export function col(name) {
  const map = {
    kids: process.env.MONGO_COLLECTION_CHILDREN || 'kids',
    parents: process.env.MONGO_COLLECTION_PARENTS || 'parents',
    professionals: process.env.MONGO_COLLECTION_PROS || 'professionals',
    checkins: process.env.MONGO_COLLECTION_CHECKINS || 'checkins',
    moods: process.env.MONGO_COLLECTION_MOODS || 'moods',
    avatars: process.env.MONGO_COLLECTION_AVATARS || 'avatars',
    classes: process.env.MONGO_COLLECTION_CLASSES || 'classes',
  };
  return map[name] || name;
}

