import styles from './InputArea.module.css';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useRef } from 'react';
import { useMoodStore } from '../../state/useMoodStore';

export function InputArea({
  note,
  onChange,
  onDrawingChange,
}: {
  note: string;
  onChange: (v: string) => void;
  onDrawingChange?: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  async function exportDrawing() {
    const url = await canvasRef.current?.exportImage('png');
    if (url && onDrawingChange) {
      onDrawingChange(url);
      // Award mood för att ha ritat
      try {
        const { award } = useMoodStore.getState();
        await award('drew');
      } catch {
        // Ignore
      }
    }
  }

  function clearDrawing() {
    canvasRef.current?.clearCanvas();
    if (onDrawingChange) onDrawingChange('');
  }

  return (
    <div className={styles.wrap}>
      <label className={styles.lbl} htmlFor="note">
        Vill du skriva något?
      </label>
      <textarea
        id="note"
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Skriv några ord om du vill…"
        aria-label="Valfri text"
      />
      <div className={styles.canvasWrap}>
        <ReactSketchCanvas
          ref={canvasRef}
          style={{ borderRadius: 10, width: '100%', height: 220, background: '#fff' }}
          strokeWidth={4}
          strokeColor="#333"
          withTimestamp={false}
        />
        <div className={styles.canvasBtns}>
          <button type="button" onClick={exportDrawing}>
            Spara teckning
          </button>
          <button type="button" onClick={clearDrawing}>
            Rensa
          </button>
        </div>
      </div>
    </div>
  );
}

