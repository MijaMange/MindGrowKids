import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { setMuted } from '../../utils/sound';
import './SettingsDrawer.css';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const [muted, setMute] = useState(false);
  const [calmMode, setCalmMode] = useState(() => {
    return localStorage.getItem('mgk-calm-mode') === '1';
  });

  useEffect(() => {
    document.body.setAttribute('data-calm', calmMode ? '1' : '0');
  }, [calmMode]);

  function toggleMute() {
    const newMuted = !muted;
    setMute(newMuted);
    setMuted(newMuted);
  }

  function toggleCalmMode() {
    const newVal = !calmMode;
    setCalmMode(newVal);
    localStorage.setItem('mgk-calm-mode', newVal ? '1' : '0');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="settings-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="settings-header">
              <h2>Inställningar</h2>
              <button className="settings-close" onClick={onClose} aria-label="Stäng">
                ✕
              </button>
            </div>

            <div className="settings-content">
              <div className="settings-section">
                <h3>Ljud</h3>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={!muted}
                    onChange={toggleMute}
                  />
                  <span className="settings-toggle-label">
                    {muted ? '🔇 Ljud av' : '🔈 Ljud på'}
                  </span>
                </label>
              </div>

              <div className="settings-section">
                <h3>Visuellt</h3>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={calmMode}
                    onChange={toggleCalmMode}
                  />
                  <span className="settings-toggle-label">
                    {calmMode ? '🌙 Calm Mode' : '☀️ Normal Mode'}
                  </span>
                </label>
                <p className="settings-hint">
                  Calm Mode reducerar rörelser och färger för en lugnare upplevelse.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

