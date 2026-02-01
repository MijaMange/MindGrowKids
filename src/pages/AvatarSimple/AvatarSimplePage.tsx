import { useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useAvatarStore } from '../../state/useAvatarStore';
import { AvatarCanvas } from '../../components/Avatar/AvatarCanvas';
import { WardrobePanel } from '../../components/Avatar/WardrobePanel';
import '../Avatar/avatar-editor.css';

/**
 * AvatarSimplePage - Fullständig avatar-editor (återanvänder AvatarEditorPage)
 * 
 * Design principles:
 * - All hooks at the top, no conditional hooks
 * - Uses the existing AvatarEditorPage component logic
 * - Updated navigation to use /test-hub
 */
export function AvatarSimplePage() {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  // Hook 1: useNavigate
  const navigate = useNavigate();
  // Hook 2: useAuth
  const { user } = useAuth();
  // Hook 3: useAvatarStore
  const { avatar, loadFromServer, saveToServer } = useAvatarStore();
  // Hook 4: useRef
  const svgRef = useRef<HTMLDivElement>(null);
  // Hook 5: useEffect (load data)
  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  // Conditional redirect is fine AFTER all hooks have been called
  if (!user) {
    return <Navigate to="/" replace />;
  }

  async function save() {
    const ok = await saveToServer();
    if (ok) {
      alert('Sparat!');
    } else {
      alert('Kunde inte spara. Försök igen.');
    }
  }

  function download() {
    // exportera SVG till PNG via canvas
    const svg = svgRef.current?.querySelector('svg');
    if (!svg) return;

    const s = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([s], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = png;
      a.download = 'mindgrow-avatar.png';
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/test-hub')}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ← Tillbaka till hub
        </button>
      </div>

      <div className="card avatar-editor-layout">
        <div ref={svgRef} className="avatar-preview">
          <AvatarCanvas data={avatar} size={280} />
        </div>
        <div className="avatar-controls">
          <h2>Jag</h2>
          <div className="wardrobe-scroll">
            <WardrobePanel />
          </div>
          <div className="avatar-actions">
            <button className="cta next" onClick={save}>
              Spara
            </button>
            <button className="cta" onClick={download}>
              Exportera PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

