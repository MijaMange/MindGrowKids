import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InputArea } from '../../components/InputArea/InputArea';
import { sfxClick, sfxSuccess, sfxWhoosh } from '../../utils/sound';
import { speak, stopSpeak } from '../../utils/tts';
import { useAuth } from '../../auth/AuthContext';
import { useMoodStore } from '../../state/useMoodStore';
import '../Journey/journey.css';

type Step = 1 | 2 | 3;
type Emotion = 'happy' | 'calm' | 'tired' | 'sad' | 'curious' | 'angry' | '';

const EMOS = [
  { key: 'happy', label: 'Glad', emoji: '😊' },
  { key: 'calm', label: 'Lugn', emoji: '🫶' },
  { key: 'tired', label: 'Trött', emoji: '😪' },
  { key: 'sad', label: 'Ledsen', emoji: '😔' },
  { key: 'curious', label: 'Nyfiken', emoji: '🧐' },
  { key: 'angry', label: 'Arg', emoji: '😠' },
];

/**
 * JourneySimplePage - Fullständig känsloresa (återanvänder FeelingJourney)
 * 
 * Design principles:
 * - All hooks at the top, no conditional hooks
 * - Uses the existing FeelingJourney component logic
 * - Updated navigation to use /test-hub instead of /dashboard
 */
export function JourneySimplePage() {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  // Hook 1: useNavigate
  const navigate = useNavigate();
  // Hook 2: useAuth
  const { user } = useAuth();
  // Hook 3: useState (step)
  const [step, setStep] = useState<Step>(1);
  // Hook 4: useState (emotion)
  const [emotion, setEmotion] = useState<Emotion>('');
  // Hook 5: useState (note)
  const [note, setNote] = useState('');
  // Hook 6: useState (drawingUrl)
  const [drawingUrl, setDrawingUrl] = useState('');
  // Hook 7: useState (reply)
  const [reply, setReply] = useState('');
  // Hook 8: useState (loading)
  const [loading, setLoading] = useState(false);
  // Hook 9: useState (showReply)
  const [showReply, setShowReply] = useState(false);
  // Hook 10: useEffect
  useEffect(() => () => stopSpeak(), []);

  // Conditional redirect is fine AFTER all hooks have been called
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const canNext = (step === 1 && !!emotion) || step === 2;

  async function submit() {
    sfxWhoosh();
    setLoading(true);
    setReply('');
    setShowReply(false);

    try {
      // Hämta AI-svar
      const resp = await fetch('/api/listen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion, note }),
      });
      const data = await resp.json();
      const text = data?.reply || 'Tack för att du berättade.';
      setReply(text);
      setShowReply(true);

      // Spara checkin till API
      try {
        const mode = drawingUrl ? 'draw' : note ? 'text' : 'voice';
        const response = await fetch('/api/checkins', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emotion,
            mode,
            note: note || undefined,
            drawingRef: drawingUrl || undefined,
          }),
        });
        if (!response.ok) {
          console.warn('Kunde inte spara checkin:', response.status);
        }
      } catch (err) {
        console.error('Fel vid sparning av checkin:', err);
      }

      sfxSuccess();
      speak(text);

      // Award mood för checkin och att ha blivit lyssnad på
      const { award } = useMoodStore.getState();
      if (emotion) {
        try {
          await award('checkin_' + emotion);
        } catch {
          // Ignore
        }
      }
      try {
        await award('listened');
      } catch {
        // Ignore
      }
    } catch {
      const text = 'Tack för att du berättade.';
      setReply(text);
      setShowReply(true);
      sfxSuccess();
      speak(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="journey-root">
      <header className="journey-hud">
        <div className="guide">
          <button
            className="back-to-hub-btn"
            onClick={() => {
              sfxClick();
              navigate('/test-hub');
            }}
            title="Tillbaka"
          >
            ◀ Tillbaka
          </button>
          <span className="guide-emoji">🌱</span>
          <span className="guide-text">
            {step === 1 && 'Hur känner din kropp sig just nu?'}
            {step === 2 && 'Vilken känsla passar bäst?'}
            {step === 3 && 'Vill du berätta mer? (Det är okej att hoppa över)'}
          </span>
        </div>
        <Progress step={step} />
      </header>

      <main className="journey-stage">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepCard key="s1" title="Hur känner din kropp sig just nu?">
              <p className="step-help-text">
                Ta en djup andetag och känn efter i din kropp. Hur mår den?
              </p>
              <div className="emoji-wheel">
                <div className="emoji-grid">
                  {EMOS.map((e) => (
                    <button
                      key={e.key}
                      className={`emoji-btn ${emotion === e.key ? 'active' : ''}`}
                      onClick={() => {
                        setEmotion(e.key as any);
                        sfxClick();
                      }}
                      aria-pressed={emotion === e.key}
                    >
                      <div style={{ fontSize: '1.4rem' }}>{e.emoji}</div>
                      <div style={{ fontWeight: 800 }}>{e.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="nav">
                <button
                  className="cta next"
                  disabled={!emotion}
                  onClick={() => {
                    setStep(2);
                    sfxWhoosh();
                  }}
                >
                  Nästa
                </button>
              </div>
            </StepCard>
          )}

          {step === 2 && (
            <StepCard key="s2" title="Vilken känsla passar bäst?">
              <p className="step-help-text">
                Du har valt: <strong>{EMOS.find(e => e.key === emotion)?.label}</strong>
              </p>
              <div className="emoji-wheel">
                <div className="emoji-grid">
                  {EMOS.map((e) => (
                    <button
                      key={e.key}
                      className={`emoji-btn ${emotion === e.key ? 'active' : ''}`}
                      onClick={() => {
                        setEmotion(e.key as any);
                        sfxClick();
                      }}
                      aria-pressed={emotion === e.key}
                    >
                      <div style={{ fontSize: '1.4rem' }}>{e.emoji}</div>
                      <div style={{ fontWeight: 800 }}>{e.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="nav">
                <button
                  className="cta back"
                  onClick={() => {
                    setStep(1);
                    sfxClick();
                  }}
                >
                  Tillbaka
                </button>
                <button
                  className="cta next"
                  onClick={() => {
                    setStep(3);
                    sfxWhoosh();
                  }}
                >
                  Nästa
                </button>
              </div>
            </StepCard>
          )}

          {step === 3 && !showReply && (
            <StepCard key="s3" title="Vill du berätta mer?">
              <p className="step-help-text">
                Det är helt okej att hoppa över detta steg om du inte vill skriva eller rita något.
              </p>
              <InputArea note={note} onChange={setNote} onDrawingChange={setDrawingUrl} />
              <div className="nav">
                <button
                  className="cta back"
                  onClick={() => {
                    setStep(2);
                    sfxClick();
                  }}
                >
                  Tillbaka
                </button>
                <button
                  className="cta ghost"
                  onClick={() => {
                    // Skip - submit without note/drawing
                    setNote('');
                    setDrawingUrl('');
                    submit();
                  }}
                  style={{ marginRight: 8 }}
                >
                  Hoppa över
                </button>
                <button className="cta send" disabled={loading} onClick={submit}>
                  {loading ? 'Skickar…' : 'Klart'}
                </button>
              </div>
            </StepCard>
          )}

          {showReply && reply && (
            <StepCard key="reply" title="Tack för att du delade!">
              <div className="bubble">{reply}</div>
              <div className="nav">
                <button
                  className="cta next"
                  onClick={() => {
                    setReply('');
                    setShowReply(false);
                    setStep(1);
                    setEmotion('');
                    setNote('');
                    setDrawingUrl('');
                    stopSpeak();
                    navigate('/test-hub');
                  }}
                >
                  Tillbaka till start
                </button>
              </div>
            </StepCard>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      className="step-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1>{title}</h1>
      <div className="content">{children}</div>
    </motion.section>
  );
}

function Progress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="progress" role="group" aria-label="Stegindikator">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`dot ${step === n ? 'active' : ''}`}
          aria-current={step === n ? 'step' : undefined}
        >
          {n}
        </div>
      ))}
    </div>
  );
}

