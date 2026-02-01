import { useEffect, useState } from 'react';
import { useCheckinStore, Emotion } from '../../state/useCheckinStore';
import { EmotionPicker } from '../../components/EmotionPicker/EmotionPicker';
import { InputArea } from '../../components/InputArea/InputArea';
import { saveDraft, loadDraft } from '../../utils/localStore';
import { ListeningAIReply } from '../../components/ListeningAIReply/ListeningAIReply';
import { playPling } from '../../utils/sound';

export function ChildPage() {
  const { emotion, note, setEmotion, setNote, reset } = useCheckinStore();
  const [drawingUrl, setDrawingUrl] = useState<string>('');
  const [serverReply, setServerReply] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const draft = loadDraft<{ emotion: Emotion; note: string; drawingUrl?: string }>({
      emotion: '',
      note: '',
    });
    if (draft.emotion) setEmotion(draft.emotion);
    if (draft.note) setNote(draft.note);
    if (draft.drawingUrl) setDrawingUrl(draft.drawingUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveDraft({ emotion, note, drawingUrl });
  }, [emotion, note, drawingUrl]);

  const canSubmit = !!emotion || !!note || !!drawingUrl;

  async function handleSubmit() {
    playPling(); // mjuk feedback
    setLoading(true);
    setServerReply('');

    try {
      const resp = await fetch('/api/listen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion, note }),
      });
      const data = await resp.json();
      setServerReply(data?.reply ?? '');
    } catch {
      setServerReply('');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    reset();
    setDrawingUrl('');
    setServerReply('');
    saveDraft({ emotion: '', note: '', drawingUrl: '' });
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 16 }}>
        <h1>Hur känner du dig idag?</h1>
        <EmotionPicker value={emotion} onSelect={(e) => setEmotion(e)} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <InputArea note={note} onChange={setNote} onDrawingChange={setDrawingUrl} />
      </div>

      <div
        className="card"
        style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          aria-disabled={!canSubmit || loading}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: !canSubmit || loading ? '#ccc' : 'var(--mg-good, #66c6a3)',
            cursor: !canSubmit || loading ? 'not-allowed' : 'pointer',
            color: !canSubmit || loading ? '#666' : '#ffffff',
          }}
        >
          {loading ? 'Lyssnar…' : 'Skicka'}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Rensa
        </button>
        <span aria-live="polite">
          {!canSubmit
            ? 'Välj en känsla eller skriv/rita något'
            : 'Redo att skicka'}
        </span>
      </div>

      <div style={{ marginTop: 16 }}>
        {/* Lokalt genererat eko OCH/ELLER serversvar. Visa serversvar om det finns. */}
        {serverReply ? (
          <div className="card" role="status" aria-live="polite">
            {serverReply}
          </div>
        ) : (
          <ListeningAIReply emotion={emotion} note={note} />
        )}
      </div>
    </div>
  );
}

