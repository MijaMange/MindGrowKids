import { useRef, useState } from 'react';
import { useJourney } from '../JourneyStore';
import { playTap } from '../sounds';

export default function StepDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const setDrawing = useJourney((s) => s.setDrawing);
  const next = useJourney((s) => s.next);

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1d2b24';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function save() {
    playTap();
    const url = canvasRef.current?.toDataURL('image/png') || '';
    setDrawing(url);
    next();
  }

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--mg-ink)' }}>
        Vill du rita lite?
      </h2>
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 16px rgba(0,0,0,.06)',
          touchAction: 'none',
          maxWidth: '100%',
          height: 'auto',
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="cta" onClick={save}>
          Spara
        </button>
        <button className="cta ghost" onClick={clear}>
          Rensa
        </button>
        <button className="cta ghost" onClick={() => next()}>
          Hoppa över
        </button>
      </div>
    </div>
  );
}




