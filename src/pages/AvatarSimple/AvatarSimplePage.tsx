import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useEmojiAvatarStore } from '../../state/useEmojiAvatarStore';
import { JourneyHeader } from '../../components/JourneyHeader/JourneyHeader';
import { ChildFlikNav } from '../../components/ChildFlikNav/ChildFlikNav';
import { FloatingAvatarPreview } from '../../components/FloatingAvatarPreview';
import { EmojiPicker } from '../../components/EmojiPicker';
import { LoadingSpinner } from '../../components/Loading/LoadingSpinner';
import { AgeGuard } from '../../components/AgeGuard/AgeGuard';
import { sfxClick } from '../../utils/sound';
import '../Journey/journey.css';
import './AvatarSimplePage.css';

/**
 * AvatarSimplePage – "Jag" profile: simple emoji picker
 *
 * - Large floating avatar preview bubble (centered)
 * - Bottom drawer/tray with emoji grid
 * - No accessories, no categories, just emoji selection
 * - Autosave on selection
 * - Child-friendly: large tap targets, clear selection
 */
export function AvatarSimplePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { emoji, setEmoji, loadFromServer, saveToServer } = useEmojiAvatarStore();
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await loadFromServer();
      setLoading(false);
    }
    load();
  }, [loadFromServer]);

  function scheduleSave() {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await saveToServer();
      saveTimeoutRef.current = null;
    }, 300);
  }

  function handleEmojiSelect(newEmoji: string) {
    setEmoji(newEmoji);
    sfxClick();
    scheduleSave();
  }

  function handleBack() {
    navigate('/hub');
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <AgeGuard>
        <div className="journey-root">
          <JourneyHeader title="Jag" onBack={handleBack} />
          <main className="journey-stage avatar-simple-main">
            <div className="avatar-simple-loading">
              <LoadingSpinner />
            </div>
          </main>
        </div>
      </AgeGuard>
    );
  }

  const displayEmoji = emoji || '😊';

  return (
    <AgeGuard>
      <div className="journey-root has-child-flik-nav">
        <JourneyHeader title="Jag" onBack={handleBack} />
        <main className="journey-stage avatar-simple-main">
          {/* Centered floating avatar preview */}
          <div className="avatar-preview-container">
            <FloatingAvatarPreview emoji={displayEmoji} size={160} />
          </div>
          {/* In-flow emoji grid so choices are always visible (no hidden tray) */}
          <EmojiPicker
            variant="inline"
            selectedEmoji={displayEmoji}
            onEmojiSelect={handleEmojiSelect}
          />
        </main>
        <ChildFlikNav />
      </div>
    </AgeGuard>
  );
}
