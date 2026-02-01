import { useJourney } from '../JourneyStore';
import { apiFetch } from '../../utils/config';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { playSuccess } from '../sounds';
import { RewardBurst } from '../ui/RewardBurst';
import { useState } from 'react';

export default function StepSummary() {
  const { emotion, note, drawingData, reset, addReward } = useJourney();
  const { user } = useAuth();
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showReward, setShowReward] = useState(false);

  async function save() {
    if (!user || user.role !== 'child') {
      alert('Du måste vara inloggad som barn');
      return;
    }

    setSaving(true);
    playSuccess();

    try {
      // Mappa svenska känslor till engelska för API
      const emotionMap: Record<string, string> = {
        glad: 'happy',
        lugn: 'calm',
        trött: 'tired',
        ledsen: 'sad',
        nyfiken: 'curious',
        arg: 'angry',
      };

      const apiEmotion = emotionMap[emotion || 'lugn'] || 'calm';

      await apiFetch('/api/checkins', {
        method: 'POST',
        body: JSON.stringify({
          emotion: apiEmotion,
          mode: drawingData ? 'draw' : 'text',
          note: note || '',
          drawingRef: drawingData || '',
        }),
      });

      // Ge belöning
      addReward(1);
      setShowReward(true);

      // Vänta lite innan reset
      setTimeout(() => {
        reset();
        nav('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Kunde inte spara checkin:', err);
      alert('Kunde inte spara. Försök igen.');
      setSaving(false);
    }
  }

  return (
    <>
      <RewardBurst show={showReward} amount={1} />
      <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--mg-ink)' }}>
          Tack! 🌟
        </h2>
        <div style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--mg-ink)' }}>
          Du kände dig: <b>{emotion}</b>
        </div>
        {note && (
          <div style={{ textAlign: 'center', fontSize: '1rem', color: 'var(--mg-ink)' }}>Anteckning: {note}</div>
        )}
        <button className="cta next" onClick={save} disabled={saving} style={{ marginTop: '12px' }}>
          {saving ? 'Sparar...' : 'Klar'}
        </button>
      </div>
    </>
  );
}


