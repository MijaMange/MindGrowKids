import { Emotion } from '../../state/useCheckinStore';

export function ListeningAIReply({ emotion, note }: { emotion: Emotion; note: string }) {
  if(!emotion) return null;
  const reply = getReflectiveReply(emotion, note);
  return (
    <div className="card" role="status" aria-live="polite">
      {reply}
    </div>
  );
}

function getReflectiveReply(emotion: Emotion, note: string){
  const base: Record<string,string> = {
    sad: "That sounds heavy. Thank you for sharing it.",
    angry: "That sounds frustrating. It's okay to feel that way.",
    happy: "That sounds lovely. I'm glad you shared that.",
    calm: "It's nice to hear you're feeling calm.",
    tired: "It's okay to rest sometimes.",
    curious: "Curiosity is a beautiful thing.",
  };
  const core = (emotion && base[emotion]) || "Thank you for telling me how you feel.";
  return note?.trim()
    ? `${core} I hear: "${sanitizeQuote(note.slice(0,120))}"`
    : core;
}

function sanitizeQuote(s: string){ return s.replace(/["""]+/g, "'"); }

