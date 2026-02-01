import { useEffect, useMemo, useState } from 'react';
import { format, isSameDay, startOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { sv } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import { useAvatarStore } from '../../state/useAvatarStore';
import { AvatarCanvas } from '../../components/Avatar/AvatarCanvas';
import './diary.css';

const EMOTION_EMOJIS: Record<string, string> = {
  happy: '😊',
  calm: '🫶',
  tired: '😪',
  sad: '😔',
  curious: '🧐',
  angry: '😠',
};

const EMOTION_COLORS: Record<string, string> = {
  happy: '#FFE66D',
  calm: '#B7D9CF',
  tired: '#D4C5E8',
  sad: '#A8DADC',
  curious: '#FFB3BA',
  angry: '#FF9A8B',
};

export default function ChildDiary() {
  const { user } = useAuth();
  const { avatar, loadFromServer } = useAvatarStore();
  const [date, setDate] = useState<Date>(new Date());
  const [rows, setRows] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);


  async function load() {
    try {
      // Hämta checkins för inloggad användare (barn)
      const r = await fetch('/api/checkins', { credentials: 'include' });
      if (r.ok) {
        const data = await r.json();
        setRows(data || []);
      } else {
        console.warn('Kunde inte ladda checkins:', r.status);
        setRows([]);
      }
    } catch (err) {
      console.error('Kunde inte ladda checkins:', err);
      setRows([]);
    }
  }

  useEffect(() => {
    loadFromServer();
    load();
  }, []);

  const todays = useMemo(
    () => rows.filter((x) => isSameDay(new Date(x.dateISO), date)),
    [rows, date]
  );

  // Get last 14 days for visual history
  const recentDays = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    }).reverse();

    return days.map((day) => {
      const dayCheckins = rows.filter((x) => isSameDay(new Date(x.dateISO), day));
      const primaryEmotion = dayCheckins[0]?.emotion || null;
      return {
        date: day,
        checkins: dayCheckins,
        emotion: primaryEmotion,
      };
    });
  }, [rows]);

  async function save() {
    if (!note.trim()) return;
    setLoading(true);
    try {
      // Spara som en ny checkin med emotion från dagens första checkin (eller calm som default)
      const body = {
        emotion: todays[0]?.emotion || 'calm',
        mode: 'text',
        note: note.trim(),
        dateISO: date.toISOString(),
      };
      const r = await fetch('/api/checkins', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        setNote('');
        await load();
      }
    } catch (err) {
      console.error('Kunde inte spara:', err);
    } finally {
      setLoading(false);
    }
  }

  const selectedDayData = recentDays.find((d) => isSameDay(d.date, date));

  return (
    <div className="diary-container">
      <div className="diary-header">
        <h1>Mina dagar</h1>
        <p className="diary-subtitle">Se dina känslor och anteckningar över tid</p>
      </div>

      {/* Visual day cards */}
      <div className="diary-days-grid">
        {recentDays.map((dayData, index) => {
          const isSelected = isSameDay(dayData.date, date);
          const isToday = isSameDay(dayData.date, new Date());
          
          return (
            <motion.button
              key={dayData.date.toISOString()}
              className={`diary-day-card ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => setDate(dayData.date)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                '--emotion-color': dayData.emotion
                  ? EMOTION_COLORS[dayData.emotion] || '#e0e0e0'
                  : '#f5f5f5',
              } as React.CSSProperties}
            >
              <div className="diary-day-date">
                {format(dayData.date, 'd MMM', { locale: sv })}
              </div>
              <div className="diary-day-emotion">
                {dayData.emotion ? (
                  <>
                    <span className="diary-day-emoji">
                      {EMOTION_EMOJIS[dayData.emotion] || '💭'}
                    </span>
                    <span className="diary-day-count">
                      {dayData.checkins.length > 0 ? dayData.checkins.length : ''}
                    </span>
                  </>
                ) : (
                  <span className="diary-day-empty">—</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected day details */}
      <div className="diary-detail-card">
        <div className="diary-detail-header">
          <h2>
            {format(date, 'EEEE d MMMM', { locale: sv })}
            {isSameDay(date, new Date()) && <span className="diary-today-badge">Idag</span>}
          </h2>
        </div>

        {selectedDayData && selectedDayData.checkins.length > 0 ? (
          <div className="diary-checkins">
            {selectedDayData.checkins.map((checkin) => (
              <motion.div
                key={checkin.id}
                className="diary-checkin-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="diary-checkin-emotion">
                  <span className="diary-checkin-emoji">
                    {EMOTION_EMOJIS[checkin.emotion] || '💭'}
                  </span>
                  <span className="diary-checkin-label">
                    {checkin.emotion === 'happy' ? 'Glad' :
                     checkin.emotion === 'calm' ? 'Lugn' :
                     checkin.emotion === 'tired' ? 'Trött' :
                     checkin.emotion === 'sad' ? 'Ledsen' :
                     checkin.emotion === 'curious' ? 'Nyfiken' :
                     checkin.emotion === 'angry' ? 'Arg' : checkin.emotion}
                  </span>
                </div>
                {checkin.note && (
                  <div className="diary-checkin-note">{checkin.note}</div>
                )}
                {checkin.drawingRef && (
                  <div className="diary-checkin-drawing">
                    <img src={checkin.drawingRef} alt="Ritning" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="diary-empty-state">
            <p>Inga anteckningar för denna dag ännu.</p>
            <p className="diary-empty-hint">
              Gå till "Hur känner jag mig idag?" för att lägga till en känsla.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

