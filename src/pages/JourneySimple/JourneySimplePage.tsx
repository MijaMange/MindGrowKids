import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { JourneyDraw } from '../../components/JourneyDraw/JourneyDraw';
import { SentenceBuilder } from '../../components/SentenceBuilder/SentenceBuilder';
import { sfxClick, sfxSuccess, sfxWhoosh } from '../../utils/sound';
import { speak, stopSpeak } from '../../utils/tts';
import { useAuth } from '../../auth/AuthContext';
import { useMoodStore } from '../../state/useMoodStore';
import { apiFetch, OfflineError } from '../../utils/config';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { enqueueCheckin } from '../../utils/offlineQueue';
import { JourneyHeader } from '../../components/JourneyHeader/JourneyHeader';
import { ChildFlikNav } from '../../components/ChildFlikNav/ChildFlikNav';
import { useAge } from '../../context/AgeContext';
import { getAgeConfig } from '../../config/ageConfig';
import { BASE_EMOTIONS } from '../../config/emotions';
import { AgeGuard } from '../../components/AgeGuard/AgeGuard';
import { Toast } from '../../components/Toast/Toast';
import '../Journey/journey.css';

type Step = 1 | 2;
type Emotion = 'happy' | 'sad' | 'angry' | 'tired' | 'afraid' | 'worried' | '';

// Color themes for the 6 base emotions – same color logic as rest of app (soft, pastel)
const EMOTION_COLORS: Record<string, { bg: string; glow: string; text: string; emojiBg: string }> = {
  happy: {
    bg: 'linear-gradient(135deg, #FFEBA6 0%, #FFD36A 100%)',
    glow: 'rgba(255, 195, 60, 0.35)',
    text: '#8B5A14',
    emojiBg: 'rgba(255, 255, 255, 0.4)',
  },
  sad: {
    bg: 'linear-gradient(135deg, #CFE7FF 0%, #9EC9FF 100%)',
    glow: 'rgba(31, 111, 255, 0.22)',
    text: '#1A4A7A',
    emojiBg: 'rgba(255, 255, 255, 0.4)',
  },
  angry: {
    bg: 'linear-gradient(135deg, #FFC0C0 0%, #FF8F8F 100%)',
    glow: 'rgba(255, 80, 80, 0.25)',
    text: '#8B2A2A',
    emojiBg: 'rgba(255, 255, 255, 0.4)',
  },
  tired: {
    bg: 'linear-gradient(135deg, #E6DAFF 0%, #C9B5FF 100%)',
    glow: 'rgba(145, 100, 255, 0.25)',
    text: '#4A2F6B',
    emojiBg: 'rgba(255, 255, 255, 0.4)',
  },
  afraid: {
    bg: 'linear-gradient(135deg, #D4C4E8 0%, #B8A0D4 100%)',
    glow: 'rgba(100, 60, 140, 0.25)',
    text: '#3D2A5C',
    emojiBg: 'rgba(255, 255, 255, 0.4)',
  },
  worried: {
    bg: 'linear-gradient(135deg, #FFE4B5 0%, #FFD08A 100%)',
    glow: 'rgba(230, 160, 50, 0.28)',
    text: '#7A5A1A',
    emojiBg: 'rgba(255, 255, 255, 0.4)',
  },
};

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
  // Hook 2.5: useAge
  const { ageGroup } = useAge();
  const ageConfig = getAgeConfig(ageGroup);
  // Hook 3: useState (step)
  const [step, setStep] = useState<Step>(1);
  // Hook 4: useState (emotion)
  const [emotion, setEmotion] = useState<Emotion>('');
  // Hook 5: useState (note)
  const [note, setNote] = useState('');
  // Hook 6: useState (drawingUrl)
  const [drawingUrl, setDrawingUrl] = useState('');
  // Hook 7: useState (reply) – kept for hook order; display uses toast only
  const [, setReply] = useState('');
  // Hook 8: useState (loading)
  const [loading, setLoading] = useState(false);
  // Hook 9: useState (showReply)
  const [showReply, setShowReply] = useState(false);
  // Hook 10: useOnlineStatus
  const isOnline = useOnlineStatus();
  // Hook 11: useState (offlineMessage)
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
  // Hook 12: useState (step2Mode)
  const [step2Mode, setStep2Mode] = useState<'hub' | 'draw' | 'write' | 'post-draw'>('hub');
  // Hook 13: useState (hasDrawing)
  const [hasDrawing, setHasDrawing] = useState(false);
  // Hook 14: useState (hasWriting)
  const [hasWriting, setHasWriting] = useState(false);
  // Hook 15: useState (savingAnimation)
  const [savingAnimation, setSavingAnimation] = useState<'drawing' | 'writing' | null>(null);
  // Hook 16: useState (drawingThumbnail)
  const [drawingThumbnail, setDrawingThumbnail] = useState<string | null>(null);
  // Hook 17: useState (showSavedItems)
  const [showSavedItems, setShowSavedItems] = useState(false);
  // Hook 18: toast feedback (Portal, always visible)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastDuration, setToastDuration] = useState(2200);
  const [toastPersist, setToastPersist] = useState(false);
  useEffect(() => () => stopSpeak(), []);

  // Debug: Ctrl+Shift+T to show toast
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setToastMessage('Testa toast');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Conditional redirect is fine AFTER all hooks have been called
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Step 1 requires emotion selection, Step 2 is optional

  async function submit() {
    sfxWhoosh();
    setLoading(true);
    setReply('');
    setToastMessage(null);
    setToastPersist(false);
    setShowReply(false);
    setOfflineMessage(null);

    const drawingData = drawingUrl || drawingThumbnail || '';
    const mode = drawingData ? 'draw' : (note ? 'text' : 'none');
    const checkinPayload = {
      emotion: emotion || 'calm',
      mode,
      note: note || undefined,
      drawingRef: drawingData || undefined,
      dateISO: new Date().toISOString(),
    };

    const defaultReply = 'Tack för att du delade med dig. Det betyder mycket att du berättar. 💚';

    function isOnlyFollowUp(t: string): boolean {
      const r = t.trim().toLowerCase();
      if (r.length > 120) return false;
      return (
        /(vill du|vill du inte)\s+(berätta|skriva|rita)\s+(lite\s+)?mer/i.test(r) ||
        /berätta\s+(lite\s+)?mer\s*\??\s*$/i.test(r) ||
        /något mer\s*\??\s*$/i.test(r)
      );
    }

    try {
      // 1) Spara checkin FÖRST så anteckningar/teckningar alltid hamnar i dagboken
      try {
        const response = await apiFetch('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkinPayload),
        });
        if (!response.ok) {
          console.warn('Kunde inte spara checkin:', response.status);
        }
      } catch (err) {
        if (err instanceof OfflineError || !isOnline) {
          enqueueCheckin(checkinPayload);
          setOfflineMessage('Sparat lokalt – skickas när du är online.');
        } else {
          console.error('Fel vid sparning av checkin:', err);
        }
      }

      // 2) Hämta mock-AI-svar (alltid med emotion, så barnet får ett svar varje gång)
      let text = defaultReply;
      try {
        const resp = await fetch('/api/listen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            emotion: emotion || 'happy',
            note: note || undefined,
          }),
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok && typeof data?.reply === 'string' && data.reply.trim()) {
          const raw = data.reply.trim();
          text = isOnlyFollowUp(raw) ? defaultReply : raw;
        }
      } catch {
        // Använd standardtext vid nätverksfel eller om servern inte svarar
      }

      setToastMessage(text);
      setToastDuration(5000);
      setToastPersist(true);
      setShowReply(true);
      sfxSuccess();
      speak(text);

      // 3) Award mood
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
      setToastMessage(defaultReply);
      setToastDuration(5000);
      setToastPersist(true);
      setShowReply(true);
      sfxSuccess();
      speak(defaultReply);
    } finally {
      setLoading(false);
    }
  }

  // Clear offline message after a few seconds
  useEffect(() => {
    if (offlineMessage) {
      const timer = setTimeout(() => setOfflineMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [offlineMessage]);

  function handleBack() {
    if (step2Mode === 'draw' || step2Mode === 'write') {
      setStep2Mode('hub');
    } else if (step2Mode === 'post-draw') {
      setStep2Mode('draw');
    } else if (step === 2) {
      setStep(1);
    } else {
      navigate('/hub');
    }
    sfxClick();
  }

  return (
    <AgeGuard>
      <div className="journey-root has-child-flik-nav">
        <JourneyHeader
        title={step === 1 ? 'Hur mår du?' : showReply ? '' : 'Rita eller skriv?'}
        showStepCounter={false}
        onBack={handleBack}
        hasDrawing={hasDrawing}
        hasWriting={hasWriting}
        onFolderClick={() => setShowSavedItems(true)}
      />

      <main className="journey-stage">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section
              key="s1"
              className="emotion-selection-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="emoji-wheel">
                <div className="emoji-grid emotion-grid-final" role="group" aria-label="Välj hur du mår">
                  {(ageConfig.emotions.length ? BASE_EMOTIONS.filter((e) => ageConfig.emotions.includes(e.key)) : BASE_EMOTIONS).map((e, index) => {
                    const colors = EMOTION_COLORS[e.key] ?? EMOTION_COLORS.happy;
                    const isSelected = emotion === e.key;
                    const hasSelection = !!emotion;
                    return (
                      <motion.button
                        key={e.key}
                        className={`emoji-btn emotion-card ${isSelected ? 'active' : ''} ${hasSelection && !isSelected ? 'faded' : ''}`}
                        onClick={() => {
                          setEmotion(e.key as Emotion);
                          sfxClick();
                          setToastMessage('Okej 💚');
                          setToastDuration(2200);
                          setToastPersist(false);
                        }}
                        aria-pressed={isSelected}
                        whileHover={{ scale: 1.08, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: hasSelection && !isSelected ? 0.72 : 1,
                          scale: isSelected ? 1.05 : 1,
                          y: isSelected ? -2 : [0, -3, 0],
                        }}
                        transition={{
                          opacity: { duration: 0.3 },
                          scale: { type: "spring", stiffness: 300, damping: 20 },
                          y: isSelected
                            ? { type: "spring", stiffness: 300, damping: 20 }
                            : {
                                duration: 4 + index * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                              },
                        }}
                        style={{
                          background: colors.bg,
                          color: colors.text,
                        }}
                      >
                        <motion.div
                          className="emoji-chip"
                          style={{
                            fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                            background: colors.emojiBg,
                          }}
                          animate={isSelected ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {e.emoji}
                        </motion.div>
                        <span className="emotion-card-label">{e.label}</span>
                        {isSelected && (
                          <motion.div
                            className="emotion-glow"
                            style={{
                              boxShadow: `0 0 24px ${colors.glow}, 0 0 48px ${colors.glow}`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0.8] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                          />
                        )}
                        {isSelected && (
                          <div className="emotion-ring" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              {/* Forward button (bottom-right) */}
              {emotion && (
                <button
                  className="journey-forward-btn journey-forward-btn--with-label"
                  onClick={() => {
                    setStep(2);
                    setStep2Mode('hub');
                    setNote('');
                    setDrawingUrl('');
                    setHasDrawing(false);
                    setHasWriting(false);
                    sfxWhoosh();
                  }}
                  aria-label="Nästa"
                >
                  <span className="journey-forward-btn-label">Nästa</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              )}
            </motion.section>
          )}

          {step === 2 && !showReply && (
            <motion.div
              key="s2"
              className="creation-selection-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Creation Hub - Default state */}
              {step2Mode === 'hub' && (
                <div className="creation-hub">
                  {/* Three BIG icon options */}
                  <div className="journey-options-grid">
                    <motion.button
                      className="journey-option-card"
                      onClick={() => {
                        setStep2Mode('draw');
                        sfxClick();
                      }}
                      aria-label="Rita"
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <span className="option-icon">🎨</span>
                      <span className="option-label">Rita</span>
                    </motion.button>
                    <motion.button
                      className="journey-option-card"
                      onClick={() => {
                        setStep2Mode('write');
                        sfxClick();
                      }}
                      aria-label="Skriv"
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <span className="option-icon">✏️</span>
                      <span className="option-label">Skriv</span>
                    </motion.button>
                    <motion.button
                      className="journey-option-card journey-option-done"
                      onClick={() => {
                        submit();
                      }}
                      disabled={loading}
                      aria-label="Klart"
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <span className="option-icon">✅</span>
                      <span className="option-label">Klart</span>
                    </motion.button>
                  </div>
                </div>
              )}
              
              {/* Draw Mode - Overlay */}
              {step2Mode === 'draw' && (
                <StepCard key="draw">
                  <div className="creation-overlay">
                    <button
                      className="creation-overlay-close"
                      onClick={() => {
                        setStep2Mode('hub');
                        sfxClick();
                      }}
                      aria-label="Tillbaka"
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <JourneyDraw
                      onDrawingChange={(url) => {
                        setDrawingUrl(url);
                        if (url) {
                          setDrawingThumbnail(url);
                        }
                      }}
                      onFinish={async () => {
                        setHasDrawing(true);
                        setSavingAnimation('drawing');
                        setToastMessage('Sparat!');
                        setToastPersist(false);
                        setToastDuration(2200);
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        setSavingAnimation(null);
                        setStep2Mode('post-draw');
                        sfxSuccess();
                      }}
                      onClear={() => {
                        setDrawingUrl('');
                        setDrawingThumbnail(null);
                        setHasDrawing(false);
                      }}
                    />
                  </div>
                </StepCard>
              )}
              
              {/* Post-Draw Choice Screen */}
              {step2Mode === 'post-draw' && (
                <StepCard key="post-draw">
                  <div className="post-draw-choice">
                    <div className="post-draw-folder">
                      <div className="folder-icon-large">📁</div>
                      {drawingThumbnail && (
                        <motion.div 
                          className="folder-thumbnail"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4, type: "spring" }}
                        >
                          <img src={drawingThumbnail} alt="Din teckning" />
                        </motion.div>
                      )}
                    </div>
                    <div className="post-draw-options">
                      <button
                        className="post-draw-option"
                        onClick={() => {
                          setStep2Mode('draw');
                          sfxClick();
                        }}
                        aria-label="Rita mer"
                      >
                        <span className="option-icon-large">✏️</span>
                        <span className="option-label-large">Rita mer</span>
                      </button>
                      {ageConfig.allowText && (
                        <button
                          className="post-draw-option"
                          onClick={() => {
                            setStep2Mode('write');
                            sfxClick();
                          }}
                          aria-label="Skriv något"
                        >
                          <span className="option-icon-large">📝</span>
                          <span className="option-label-large">Skriv något</span>
                        </button>
                      )}
                      <button
                        className="post-draw-option post-draw-done"
                        onClick={() => {
                          submit();
                        }}
                        disabled={loading}
                        aria-label="Klar"
                      >
                        <span className="option-icon-large">➡️</span>
                        <span className="option-label-large">Klar</span>
                      </button>
                    </div>
                  </div>
                </StepCard>
              )}
              
              {/* Write Mode - Sentence builder for 6-7, free writing for 8-10 */}
              {step2Mode === 'write' && ageConfig.allowText && (
                <StepCard key="write">
                  <div className="creation-overlay">
                    <button
                      className="creation-overlay-close"
                      onClick={() => {
                        setStep2Mode('hub');
                        sfxClick();
                      }}
                      aria-label="Tillbaka"
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    {ageConfig.allowFreeWriting ? (
                      // Free writing for 8-10
                      <div className="free-writing-container">
                        <label htmlFor="free-writing-textarea" className="free-writing-label">
                          Berätta mer om hur du känner dig
                        </label>
                        <textarea
                          id="free-writing-textarea"
                          className="free-writing-textarea"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Skriv här..."
                          rows={8}
                        />
                        <button
                          className="cta next free-writing-save"
                          onClick={() => {
                            setHasWriting(true);
                            setSavingAnimation('writing');
                            setToastMessage('Sparat!');
                            setToastPersist(false);
                            setTimeout(() => {
                              setSavingAnimation(null);
                              setStep2Mode('hub');
                              sfxSuccess();
                            }, 1500);
                          }}
                        >
                          Klar
                        </button>
                      </div>
                    ) : (
                      // Sentence builder for 6-7
                      <SentenceBuilder
                        note={note}
                        onChange={setNote}
                        onFinish={() => {
                          setHasWriting(true);
                          setSavingAnimation('writing');
                          setToastMessage('Sparat!');
                          setToastPersist(false);
                          setToastDuration(2200);
                          setTimeout(() => {
                            setSavingAnimation(null);
                            setStep2Mode('hub');
                            sfxSuccess();
                          }, 1500);
                        }}
                      />
                    )}
                  </div>
                </StepCard>
              )}
              
              {/* Saving animation */}
              {savingAnimation && (
                <div className="saving-animation" aria-live="polite" aria-atomic="true">
                  <div className={`saving-item saving-${savingAnimation}`}>
                    {savingAnimation === 'drawing' ? '🎨' : '✏️'}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {offlineMessage && (
            <div className="journey-offline-message" role="status" aria-live="polite">
              <span>📡</span>
              <span>{offlineMessage}</span>
            </div>
          )}
          {showReply && (
            <motion.div
              key="done"
              className="journey-thank-you-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {toastMessage && (
                <motion.div
                  className="journey-thank-you-card journey-thank-you-card--large"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <p className="journey-thank-you-message journey-thank-you-message--scroll">
                    {toastMessage}
                  </p>
                  <button
                    type="button"
                    className="journey-thank-you-read-aloud"
                    onClick={() => speak(toastMessage)}
                    aria-label="Läs upp svaret"
                  >
                    <span aria-hidden>🔊</span> Läs upp
                  </button>
                </motion.div>
              )}
              <motion.button
                className="journey-thank-you-next"
                onClick={() => {
                  setReply('');
                  setShowReply(false);
                  setStep(1);
                  setEmotion('');
                  setNote('');
                  setDrawingUrl('');
                  setToastMessage(null);
                  setToastPersist(false);
                  stopSpeak();
                  navigate('/hub');
                }}
                aria-label="Klart, tillbaka till start"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <span className="journey-thank-you-next-label">Klart</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ChildFlikNav />

      {/* Saved Items Modal */}
      {showSavedItems && (
        <div 
          className="saved-items-overlay"
          onClick={() => setShowSavedItems(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Sparade teckningar och anteckningar"
        >
          <div 
            className="saved-items-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="saved-items-close"
              onClick={() => setShowSavedItems(false)}
              aria-label="Stäng"
            >
              ×
            </button>
            <h2 className="saved-items-title">Mina sparade saker</h2>
            <div className="saved-items-content">
              {(drawingThumbnail || drawingUrl) && (
                <div className="saved-item">
                  <div className="saved-item-label">🎨 Min teckning</div>
                  <img 
                    src={drawingThumbnail || drawingUrl || ''} 
                    alt="Min teckning" 
                    className="saved-item-image"
                  />
                </div>
              )}
              {note && note.trim() && (
                <div className="saved-item">
                  <div className="saved-item-label">✏️ Min anteckning</div>
                  <div className="saved-item-text">{note}</div>
                </div>
              )}
              {!(drawingThumbnail || drawingUrl) && !note?.trim() && (
                <div className="saved-items-empty">
                  <p>Du har inte sparat något i denna resa ännu.</p>
                  <p className="saved-items-empty-hint">Se alla sparade teckningar och anteckningar under <strong>Mina dagar</strong> i menyn.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast döljs på tack-skärmen – AI-svaret visas i det stora kortet istället */}
      <Toast
        message={showReply ? null : toastMessage}
        onHide={() => setToastMessage(null)}
        durationMs={toastDuration}
        persist={toastPersist}
      />
      </div>
    </AgeGuard>
  );
}

function StepCard({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      className={className ? `step-card ${className}` : 'step-card'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title && <h1>{title}</h1>}
      <div className="content">{children}</div>
    </motion.section>
  );
}


