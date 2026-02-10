import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { InputArea } from '../../components/InputArea/InputArea';
import { sfxClick, sfxSuccess, sfxWhoosh } from '../../utils/sound';
import { speak, stopSpeak } from '../../utils/tts';
import { useAuth } from '../../auth/AuthContext';
import { useMoodStore } from '../../state/useMoodStore';
import { BASE_EMOTIONS } from '../../config/emotions';
import './journey.css';

type Step = 1 | 2 | 3;
type Emotion = 'happy' | 'sad' | 'angry' | 'tired' | 'afraid' | 'worried' | '';

export default function FeelingJourney() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [emotion, setEmotion] = useState<Emotion>('');
  const [note, setNote] = useState('');
  const [drawingUrl, setDrawingUrl] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const canNext = (step === 1 && !!emotion) || step === 2;

  useEffect(() => () => stopSpeak(), []);

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
        const mode = drawingUrl ? 'draw' : 'text';
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
              navigate('/dashboard');
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
                <div className="emoji-grid emotion-grid-final" role="group" aria-label="Välj hur du mår">
                  {BASE_EMOTIONS.map((e) => (
                    <button
                      key={e.key}
                      className={`emoji-btn emotion-card ${emotion === e.key ? 'active' : ''}`}
                      onClick={() => {
                        setEmotion(e.key as any);
                        sfxClick();
                      }}
                      aria-pressed={emotion === e.key}
                    >
                      <div className="emoji-chip" style={{ fontSize: '1.4rem' }}>{e.emoji}</div>
                      <span className="emotion-card-label">{e.label}</span>
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
                Du har valt: <strong>{BASE_EMOTIONS.find(e => e.key === emotion)?.label}</strong>
              </p>
              <div className="emoji-wheel">
                <div className="emoji-grid emotion-grid-final" role="group" aria-label="Välj hur du mår">
                  {BASE_EMOTIONS.map((e) => (
                    <button
                      key={e.key}
                      className={`emoji-btn emotion-card ${emotion === e.key ? 'active' : ''}`}
                      onClick={() => {
                        setEmotion(e.key as any);
                        sfxClick();
                      }}
                      aria-pressed={emotion === e.key}
                    >
                      <div className="emoji-chip" style={{ fontSize: '1.4rem' }}>{e.emoji}</div>
                      <span className="emotion-card-label">{e.label}</span>
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
                    navigate('/dashboard');
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

