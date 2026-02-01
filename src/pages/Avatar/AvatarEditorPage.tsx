import { useEffect, useRef } from 'react';
import { useAvatarStore } from '../../state/useAvatarStore';
import { useMoodStore } from '../../state/useMoodStore';
import { AvatarCanvas } from '../../components/Avatar/AvatarCanvas';
import { WardrobePanel } from '../../components/Avatar/WardrobePanel';
import { MoodMeters } from '../../components/Stats/MoodMeters';
import './avatar-editor.css';

export default function AvatarEditorPage() {
  const { avatar, loadFromServer, saveToServer } = useAvatarStore();
  const { values, load, award } = useMoodStore();
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFromServer();
    load();
  }, [loadFromServer, load]);

  async function save() {
    const ok = await saveToServer();
    if (ok) alert('Sparat!');
    else alert('Kunde inte spara. Försök igen.');
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

          <div className="card" style={{ marginTop: 12, padding: 12 }}>
            <h3>Mitt humör</h3>
            <MoodMeters values={values} />
            {/* Devknappar (frivilligt) */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <button className="cta" onClick={() => award('drew')}>
                + Rita (calm/joy)
              </button>
              <button className="cta" onClick={() => award('listened')}>
                + Lyssnat (love)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

