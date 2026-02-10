import { useRef, useState, useCallback } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useMoodStore } from '../../state/useMoodStore';
import './JourneyDraw.css';

interface JourneyDrawProps {
  onDrawingChange: (dataUrl: string) => void;
  onFinish: () => void;
  onClear: () => void;
  isOverlay?: boolean;
}

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
}

const EMOJI_STICKERS = ['😀', '😢', '😡', '😴', '❤️', '⭐', '🌈', '☁️', '🔥', '💧', '🌸', '🐻', '🦋'];

/**
 * JourneyDraw - Large drawing canvas for step 2 with emoji stickers
 * 
 * Features:
 * - Large canvas (fills most of panel)
 * - Colored background (not white)
 * - Thick rounded border
 * - BIG icons for actions (Finish, Clear)
 * - Emoji sticker toolbar
 * - Draggable stickers above canvas
 */
export function JourneyDraw({ onDrawingChange, onFinish, onClear, isOverlay = false }: JourneyDrawProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [hasCanvasPaths, setHasCanvasPaths] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  function addSticker(emoji: string) {
    if (!canvasWrapperRef.current) return;
    const rect = canvasWrapperRef.current.getBoundingClientRect();
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      x: rect.width / 2 - 32, // Center of canvas
      y: rect.height / 2 - 32,
      scale: 1,
    };
    setStickers([...stickers, newSticker]);
  }

  function removeSticker(id: string) {
    setStickers(stickers.filter(s => s.id !== id));
  }

  function handleStickerStart(e: React.MouseEvent | React.TouchEvent, sticker: Sticker) {
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = canvasWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingId(sticker.id);
    setDragOffset({
      x: clientX - rect.left - sticker.x,
      y: clientY - rect.top - sticker.y,
    });

    // Long press for delete (only on touch)
    if ('touches' in e) {
      const timer = setTimeout(() => {
        removeSticker(sticker.id);
        setLongPressTimer(null);
        setDraggingId(null);
      }, 800);
      setLongPressTimer(timer);
    }
  }

  function handleStickerMove(e: React.MouseEvent | React.TouchEvent) {
    if (!draggingId || !canvasWrapperRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = canvasWrapperRef.current.getBoundingClientRect();
    const x = clientX - rect.left - dragOffset.x;
    const y = clientY - rect.top - dragOffset.y;

    setStickers(stickers.map(s => 
      s.id === draggingId ? { ...s, x, y } : s
    ));
  }

  function handleStickerEnd() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    if (draggingId) {
      setDraggingId(null);
    }
  }

  async function handleFinish() {
    // Check if there's any content (drawing or stickers)
    const hasStickers = stickers.length > 0;
    
    // Export canvas (even if empty, we'll check later)
    const canvasUrl = await canvasRef.current?.exportImage('png');
    
    // If no canvas and no stickers, don't proceed
    if (!canvasUrl && !hasStickers) {
      return;
    }
    
    if (!canvasWrapperRef.current) return;

    // Create composite image with stickers
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvasWrapperRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw canvas image
    const img = new Image();
    img.src = canvasUrl;
    await new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(null);
      };
    });

    // Draw stickers (adjust for canvas wrapper padding: 8px)
    stickers.forEach(sticker => {
      ctx.font = `${64 * sticker.scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Account for canvas wrapper padding (8px) and center emoji
      ctx.fillText(sticker.emoji, sticker.x + 8 + 32, sticker.y + 8 + 32);
    });

    const compositeUrl = canvas.toDataURL('image/png');
    onDrawingChange(compositeUrl);
    
    // Award mood för att ha ritat
    try {
      const { award } = useMoodStore.getState();
      await award('drew');
    } catch {
      // Ignore
    }
    
    // In overlay mode, just save and return to hub (onFinish handles animation)
    // In non-overlay mode, finish the journey
    onFinish();
  }

  function handleClear() {
    canvasRef.current?.clearCanvas();
    setStickers([]);
    setHasCanvasPaths(false);
    onDrawingChange('');
    onClear();
  }

  return (
    <div className="journey-draw-container">
      {/* Emoji toolbar */}
      <div className="journey-draw-emoji-toolbar">
        {EMOJI_STICKERS.map(emoji => (
          <button
            key={emoji}
            className="journey-draw-emoji-btn"
            onClick={() => addSticker(emoji)}
            aria-label={`Lägg till ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Canvas with sticker layer */}
      <div 
        ref={canvasWrapperRef}
        className="journey-draw-canvas-wrapper"
        onMouseMove={handleStickerMove}
        onMouseUp={handleStickerEnd}
        onMouseLeave={handleStickerEnd}
        onTouchMove={handleStickerMove}
        onTouchEnd={handleStickerEnd}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          className="journey-draw-canvas"
          strokeWidth={6}
          strokeColor="#2f2f2f"
          withTimestamp={false}
          onChange={(paths) => setHasCanvasPaths(paths.length > 0)}
        />
        {/* Sticker layer */}
        <div className="journey-draw-sticker-layer">
          {stickers.map(sticker => (
            <div
              key={sticker.id}
              className="journey-draw-sticker"
              style={{
                left: `${sticker.x}px`,
                top: `${sticker.y}px`,
                transform: `scale(${sticker.scale})`,
                cursor: draggingId === sticker.id ? 'grabbing' : 'grab',
              }}
              onMouseDown={(e) => handleStickerStart(e, sticker)}
              onTouchStart={(e) => handleStickerStart(e, sticker)}
            >
              <span className="sticker-emoji">{sticker.emoji}</span>
              <button
                className="sticker-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSticker(sticker.id);
                }}
                aria-label="Ta bort"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Clear button (secondary, top-left) */}
      <button
        className="journey-draw-clear-btn"
        onClick={handleClear}
        aria-label="Rensa"
      >
        <span className="clear-icon">🗑️</span>
      </button>
      
      {/* Forward arrow (primary, bottom-right) - always visible, disabled when no content */}
      <button
        className="journey-draw-forward-btn"
        onClick={handleFinish}
        aria-label="Fortsätt"
        disabled={stickers.length === 0 && !hasCanvasPaths}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  );
}
