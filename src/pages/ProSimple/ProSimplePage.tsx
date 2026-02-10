import { createPortal } from 'react-dom';
import { useEffect, useState, useCallback } from 'react';
import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';
import { LoadingSpinner } from '../../components/Loading/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SchoolSubscriptionRequiredModal } from '../../components/SchoolSubscriptionRequiredModal/SchoolSubscriptionRequiredModal';
import { MindGrowLogo } from '../../components/Logo/MindGrowLogo';
import { ClassDiaryContent } from '../../components/ClassDiaryContent';
import { getEmotionLabel } from '../../config/emotions';
import { exportStatsPdf } from '../../utils/exportStatsPdf';
import { setMuted } from '../../utils/sound';
import '../../components/AdultPageShell/AdultPageShell.css';
import './ProSimplePage.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

const DEMO_STUDENTS: { id: string; name: string }[] = [
  { id: 'demo-1', name: 'Demo elev 1' },
  { id: 'demo-2', name: 'Demo elev 2' },
  { id: 'demo-3', name: 'Demo elev 3' },
];

type Student = { id: string; name: string; emoji?: string; summary?: string; gender?: 'male' | 'female' | null };

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
function VolumeIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}
function ExportPdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 18v-6" />
      <path d="M9 15h6" />
    </svg>
  );
}

/**
 * ProSimplePage - Lärarvy "Min klass" med prototyp-design
 * Grön gradient, glass-kort, 2-kolumn layout, elevlista med sök, elev-drawer, sticky actions.
 */
export function ProSimplePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  type ClassItem = {
    code: string;
    name: string;
    students: Student[];
    classMood?: 'good' | 'ok' | 'bad';
    classMoodLabel?: string;
    classMoodEmoji?: string;
  };
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('Min klass');
  const [students, setStudents] = useState<Student[]>([]);
  const [weekly, setWeekly] = useState<any>({ buckets: {}, timeSeries: [], total: 0 });
  const [summary, setSummary] = useState<any>({ summaryText: '', topEmotion: '', total: 0 });
  const [loading, setLoading] = useState(true);
  const [seedClassLoading, setSeedClassLoading] = useState(false);
  const [showSchoolSubscriptionRequired, setShowSchoolSubscriptionRequired] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null);
  const [muted, setMutedState] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'elevlista' | 'statistik' | 'dagbok'>('elevlista');

  const loadMyClasses = useCallback(async () => {
    try {
      const r = await fetch('/api/pro/my-classes', { credentials: 'include' });
      if (r.ok) {
        const d = await r.json();
        if (d.classes?.length > 0) {
          setClasses(d.classes);
          const first = d.classes[0];
          setCode(first.code);
          setName(first.name || 'Min klass');
          setStudents(first.students || []);
          return;
        }
        setClasses([]);
        setCode('');
        setName('Min klass');
        setStudents([]);
        return;
      }
      const fallback = await fetch('/api/pro/my-class', { credentials: 'include' });
      if (fallback.ok) {
        const d = await fallback.json();
        if (d.classCode) {
          const item: ClassItem = { code: d.classCode, name: d.name || 'Min klass', students: d.students || [] };
          setClasses([item]);
          setCode(item.code);
          setName(item.name);
          setStudents(item.students);
        }
      }
    } catch (err) {
      console.error('Kunde inte ladda klasser:', err);
      try {
        const r = await fetch('/api/pro/my-class', { credentials: 'include' });
        if (r.ok) {
          const d = await r.json();
          if (d.classCode) {
            const item: ClassItem = { code: d.classCode, name: d.name || 'Min klass', students: d.students || [] };
            setClasses([item]);
            setCode(item.code);
            setName(item.name);
            setStudents(item.students);
          }
        }
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyClasses();
  }, [loadMyClasses]);

  const loadStudents = useCallback(async (c: string) => {
    if (!c) return;
    try {
      const r = await fetch(`/api/classes/${c}/students`, { credentials: 'include' });
      const d = await r.json();
      setStudents(Array.isArray(d) ? d : d?.students || []);
    } catch (err) {
      console.error('Kunde inte ladda elever:', err);
      setStudents([]);
    }
  }, []);

  function selectClass(cl: ClassItem) {
    setCode(cl.code);
    setName(cl.name);
    setStudents(cl.students);
  }

  useEffect(() => {
    if (code && classes.some((c) => c.code === code)) {
      const cl = classes.find((c) => c.code === code);
      if (cl) setStudents(cl.students);
    } else if (code) {
      loadStudents(code);
    }
  }, [code]);

  useEffect(() => {
    const from = new Date(Date.now() - 7 * 86400000).toISOString();
    const to = new Date().toISOString();
    fetch(`/api/analytics/weekly?from=${from}&to=${to}`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setWeekly)
      .catch(() => setWeekly({ buckets: {}, timeSeries: [], total: 0 }));
    fetch(`/api/analytics/summary?from=${from}&to=${to}`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => setSummary({ summaryText: '', topEmotion: '', total: 0 }));
  }, []);

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'pro') return <Navigate to="/hub" replace />;

  async function seedClass() {
    setSeedClassLoading(true);
    try {
      const r = await fetch('/api/dev/seed-class', { method: 'POST', credentials: 'include' });
      const d = await r.json();
      if (d.ok && d.classCode) {
        const res = await fetch('/api/pro/my-classes', { credentials: 'include' });
        const data = await res.json().catch(() => ({ classes: [] }));
        if (data.classes?.length) {
          setClasses(data.classes);
          const newCl = data.classes.find((c: ClassItem) => c.code === d.classCode);
          if (newCl) {
            setCode(newCl.code);
            setName(newCl.name);
            setStudents(newCl.students || []);
          } else {
            setCode(d.classCode);
            setName(d.className || 'Demo klass');
            loadStudents(d.classCode);
          }
        } else {
          await loadMyClasses();
          setCode(d.classCode);
          setName(d.className || 'Demo klass');
          loadStudents(d.classCode);
        }
      } else {
        alert(d.message || 'Kunde inte skapa klass');
      }
    } catch (err) {
      console.error('Seed class error:', err);
      alert('Kunde inte simulera klass. Kontrollera att servern körs.');
    } finally {
      setSeedClassLoading(false);
    }
  }

  async function deleteClass(classCode: string) {
    if (!window.confirm('Vill du radera denna klass? Elever och deras data i klassen tas bort.')) return;
    try {
      const r = await fetch(`/api/classes/${classCode}`, { method: 'DELETE', credentials: 'include' });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        await loadMyClasses();
      } else {
        alert(d.message || 'Kunde inte radera klassen.');
      }
    } catch (err) {
      console.error('Delete class error:', err);
      alert('Kunde inte radera klassen.');
    }
  }

  async function createClass() {
    try {
      const r = await fetch('/api/classes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.code) {
        await loadMyClasses();
      } else if (d.error === 'school_subscription_required') {
        setShowSchoolSubscriptionRequired(true);
      } else {
        alert(d.message || 'Kunde inte skapa klass.');
      }
    } catch (err) {
      console.error('Kunde inte skapa klass:', err);
      alert('Kunde inte skapa klass.');
    }
  }

  function handleCopyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1400);
    });
  }

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  }

  const filteredStudents = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : students;
  const displayStudents = filteredStudents.length > 0 ? filteredStudents : (students.length === 0 ? DEMO_STUDENTS : []);

  const labels = Object.keys(weekly.buckets || {});
  const values = Object.values(weekly.buckets || {});

  const doughnutData = {
    labels: labels.map((l) => getEmotionLabel(l) || l),
    datasets: [
      {
        data: values,
        backgroundColor: ['#FFE66D', '#B7D9CF', '#D4C5E8', '#A8DADC', '#FFB3BA', '#FF9A8B'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: 'rgba(255,255,255,0.9)', font: { size: 12 } },
      },
      tooltip: {
        titleColor: '#1d2b24',
        bodyColor: '#1d2b24',
      },
    },
  };
  const lineChartOptions = {
    ...chartOptions,
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.85)' }, grid: { color: 'rgba(255,255,255,0.12)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.85)' }, grid: { color: 'rgba(255,255,255,0.12)' } },
    },
  };

  if (loading) {
    return (
      <div className="pro-class-page">
        <div className="pro-class-loading">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const periodFrom = new Date(Date.now() - 7 * 86400000);
  const periodTo = new Date();

  // Simulerad veckotrend när API returnerar tom data (t.ex. fil-DB / pitch-demo) – deterministisk utifrån datum
  function getSimulatedWeekTrend(): { date: string; buckets: Record<string, number> }[] {
    const out: { date: string; buckets: Record<string, number> }[] = [];
    const emotions = ['happy', 'calm', 'curious', 'tired', 'sad', 'angry'];
    const seed = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
      return Math.abs(h);
    };
    for (let d = 6; d >= 0; d--) {
      const date = new Date(Date.now() - d * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const r = (seed(dateStr) % 100) / 100;
      const total = 10 + Math.floor(r * 22) + (d === 0 ? 4 : 0);
      const buckets: Record<string, number> = {};
      let remaining = total;
      emotions.forEach((e, i) => {
        const p = 0.15 + (seed(dateStr + e) % 30) / 100;
        const part = i === emotions.length - 1 ? remaining : Math.floor(remaining * p);
        buckets[e] = Math.max(0, part);
        remaining -= buckets[e];
      });
      if (remaining > 0) buckets[emotions[0]] = (buckets[emotions[0]] || 0) + remaining;
      out.push({ date: dateStr, buckets });
    }
    return out;
  }
  const timeSeriesToShow = weekly.timeSeries?.length > 0 ? weekly.timeSeries : getSimulatedWeekTrend();

  function handleExportPdf() {
    exportStatsPdf({
      summaryText: summary.summaryText ?? '',
      topEmotion: summary.topEmotion ?? '',
      total: summary.total ?? weekly.total ?? 0,
      buckets: weekly.buckets ?? {},
      timeSeries: timeSeriesToShow,
      periodFrom,
      periodTo,
      className: name || 'Klassen',
    });
  }

  return (
    <div className="pro-class-page">
      {/* Sticky header: MindGrow logo vänster, titel, Lärarvy + namn + ljud + meny */}
      <header className="pro-class-header">
        <div className="pro-class-header-left">
          <Link to="/hub" className="pro-class-logo-link" aria-label="Till översikt">
            <MindGrowLogo variant="dark" size="sm" withWordmark animateLetters={false} />
          </Link>
          <span className="pro-class-header-title">Min klass</span>
        </div>
        <div className="pro-class-header-right">
          <span className="pro-class-pill pro-class-pill-label">Lärarvy</span>
          <span className="pro-class-header-name" title={user?.name || undefined}>{user?.name || 'Lärare'}</span>
          <button
            type="button"
            className="pro-class-ghost-btn"
            onClick={toggleMute}
            aria-label={muted ? 'Ljud på' : 'Ljud av'}
          >
            <VolumeIcon muted={muted} />
          </button>
          <button
            type="button"
            className="pro-class-ghost-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Meny"
            aria-expanded={menuOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {menuOpen && createPortal(
        <div
          className="adult-shell-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Navigationsmeny"
          onClick={() => setMenuOpen(false)}
        >
          <nav className="adult-shell-nav-panel" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="adult-shell-close" onClick={() => setMenuOpen(false)} aria-label="Stäng meny">
              ×
            </button>
            <ul className="adult-shell-nav-list">
              <li><Link to="/hub" onClick={() => setMenuOpen(false)} className={`adult-shell-nav-link ${location.pathname === '/hub' ? 'active' : ''}`}><span className="adult-shell-nav-icon">🏠</span><span className="adult-shell-nav-label">Översikt</span></Link></li>
              <li><Link to="/app/pro-simple" onClick={() => setMenuOpen(false)} className={`adult-shell-nav-link ${location.pathname === '/app/pro-simple' ? 'active' : ''}`}><span className="adult-shell-nav-icon">🏫</span><span className="adult-shell-nav-label">Klassens statistik</span></Link></li>
              <li><Link to="/app/pro-diary-simple" onClick={() => setMenuOpen(false)} className={`adult-shell-nav-link ${location.pathname === '/app/pro-diary-simple' ? 'active' : ''}`}><span className="adult-shell-nav-icon">📘</span><span className="adult-shell-nav-label">Klassens dagbok</span></Link></li>
              <li><Link to="/app/settings" onClick={() => setMenuOpen(false)} className={`adult-shell-nav-link ${location.pathname === '/app/settings' ? 'active' : ''}`}><span className="adult-shell-nav-icon">⚙️</span><span className="adult-shell-nav-label">Inställningar</span></Link></li>
            </ul>
            <div className="adult-shell-nav-footer">
              <button type="button" className="adult-shell-logout" onClick={handleLogout}>Logga ut</button>
            </div>
          </nav>
        </div>,
        document.body
      )}

      <main className="pro-class-content">
        {!code ? (
          <div className="pro-class-soft-card pro-class-create-wrap">
            <h2 className="pro-class-soft-card-title">Skapa klass</h2>
            <p style={{ color: 'var(--mg-grey-text)', marginBottom: 12 }}>
              Du har ingen klass ännu. Skapa en klasskod som eleverna använder vid inloggning.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Klassens namn"
              aria-label="Klassens namn"
            />
            <button type="button" className="pro-class-btn pro-class-btn-primary" onClick={createClass}>
              Skapa klasskod
            </button>
            {import.meta.env.DEV && (
              <button
                type="button"
                className="pro-class-btn pro-class-btn-secondary"
                style={{ marginTop: 8 }}
                onClick={seedClass}
                disabled={seedClassLoading}
              >
                {seedClassLoading ? 'Skapar...' : 'Simulera hel klass'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Översikt (vänster) + åtgärder (höger) på samma rad – balanserat */}
            <div className="pro-class-hero-row">
              <section className="pro-class-hero">
                <h1 className="pro-class-hero-title">Översikt över din klass</h1>
                <p className="pro-class-hero-desc">Kopiera klasskod eller visa QR så att elever kan ansluta. Välj klass nedan för att se elevlista och statistik.</p>
              </section>
              <div className="pro-class-actions-row">
                {code && (
                  <>
                    <button
                      type="button"
                      className="pro-class-icon-btn"
                      onClick={() => loadStudents(code)}
                      aria-label="Uppdatera elevlista"
                    >
                      <RefreshIcon />
                    </button>
                    {import.meta.env.DEV && (
                      <button
                        type="button"
                        className="pro-class-btn pro-class-btn-secondary"
                        onClick={seedClass}
                        disabled={seedClassLoading}
                      >
                        {seedClassLoading ? 'Skapar...' : 'Simulera: lägg till klass'}
                      </button>
                    )}
                  </>
                )}
                <div className="pro-class-tabs" role="tablist" aria-label="Välj vy">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'elevlista'}
                    className={`pro-class-tab ${activeTab === 'elevlista' ? 'active' : ''}`}
                    onClick={() => setActiveTab('elevlista')}
                  >
                    👥 Elevlista
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'statistik'}
                    className={`pro-class-tab ${activeTab === 'statistik' ? 'active' : ''}`}
                    onClick={() => setActiveTab('statistik')}
                  >
                    📊 Statistik
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'dagbok'}
                    className={`pro-class-tab ${activeTab === 'dagbok' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dagbok')}
                  >
                    📘 Klassens dagbok
                  </button>
                </div>
                <button
                  type="button"
                  className="pro-class-icon-btn"
                  onClick={handleExportPdf}
                  aria-label="Exportera statistik som PDF"
                >
                  <ExportPdfIcon />
                </button>
              </div>
            </div>

            {/* Klassväljare – under Översikt-raden */}
            {classes.length > 0 && (
              <div className="pro-class-class-switcher">
                <span className="pro-class-class-switcher-label">Klass:</span>
                <div className="pro-class-class-switcher-list" role="tablist" aria-label="Välj klass">
                  {classes.map((cl) => (
                    <span key={cl.code} className="pro-class-class-tab-wrap">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={cl.code === code}
                        className={`pro-class-class-tab ${cl.code === code ? 'active' : ''}`}
                        onClick={() => selectClass(cl)}
                      >
                        {cl.name}
                      </button>
                      <button
                        type="button"
                        className="pro-class-class-delete"
                        onClick={(e) => { e.stopPropagation(); deleteClass(cl.code); }}
                        aria-label={`Radera ${cl.name}`}
                        title="Radera klassen"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'elevlista' && (
              <div className="pro-class-tab-panel">
                {/* Klasskod + QR-kod i samma block */}
                <div className="pro-class-soft-card pro-class-code-qr-block">
                  <div className="pro-class-code-qr-inner">
                    {/* Status till läraren – tamagotchi-liknande */}
                    {(() => {
                      const current = classes.find((c) => c.code === code);
                      const label = current?.classMoodLabel ?? 'Okej';
                      const emoji = current?.classMoodEmoji ?? '😐';
                      const moodClass = current?.classMood ? `pro-class-mood--${current.classMood}` : '';
                      return (
                        <div className={`pro-class-mood-box ${moodClass}`} aria-live="polite">
                          <span className="pro-class-mood-emoji" aria-hidden>{emoji}</span>
                          <div className="pro-class-mood-text">
                            <span className="pro-class-mood-label">Din klass mår:</span>
                            <span className="pro-class-mood-value">{label}</span>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="pro-class-code-section">
                      <h2 className="pro-class-soft-card-title">Klasskod</h2>
                      <div className="pro-class-code-wrap">
                        <p className="pro-class-code-value">{code}</p>
                        <button
                          type="button"
                          className="pro-class-code-copy"
                          onClick={handleCopyCode}
                          aria-label={copiedCode ? 'Kopierad' : 'Kopiera klasskod'}
                        >
                          {copiedCode ? <><CheckIcon /> Kopierad</> : <><CopyIcon /> Kopiera</>}
                        </button>
                      </div>
                      <div className="pro-class-code-info">
                        <InfoIcon />
                        <span>Elever kan scanna QR-koden eller skriva in koden vid barninloggning.</span>
                      </div>
                      <span className="pro-class-status-pill">Aktiv</span>
                    </div>
                    <div className="pro-class-qr-section">
                      <h2 className="pro-class-soft-card-title">QR-kod</h2>
                      <div className="pro-class-qr-wrap">
                        <img src={`/api/classes/${code}/qrcode`} alt="QR-kod för klassloggning" className="pro-class-qr-image" />
                        <p className="pro-class-qr-tip">Elever scannar för snabb inloggning till klassen.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elever – tar resten av ytan */}
                <div className="pro-class-soft-card pro-class-elevlist-card">
                  <h2 className="pro-class-soft-card-title">Elever</h2>
                  <div className="pro-class-students-header">
                    <div className="pro-class-search-wrap">
                      <SearchIcon />
                      <input
                        type="search"
                        className="pro-class-search-input"
                        placeholder="Sök elev..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Sök elever"
                      />
                    </div>
                  </div>
                  <ul className="pro-class-students-list" role="list">
                    {displayStudents.length > 0 ? (
                      displayStudents.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            className={`pro-class-student-row${s.gender ? ` pro-class-student--${s.gender}` : ''}`}
                            onClick={() => setDrawerStudent(s)}
                            aria-label={`Visa ${s.name}`}
                          >
                            <span className="pro-class-student-emoji" aria-hidden>{s.emoji || '👤'}</span>
                            <div className="pro-class-student-info">
                              <p className="pro-class-student-name">{s.name}</p>
                              <p className="pro-class-student-last">{s.summary || 'Ingen data ännu'}</p>
                            </div>
                            <span className="pro-class-student-visa">Visa</span>
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="pro-class-students-empty">Inga elever matchar sökningen.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'dagbok' && (
              <div className="pro-class-tab-panel pro-class-tab-panel-dagbok">
                <ClassDiaryContent />
              </div>
            )}

            {activeTab === 'statistik' && (
              <div className="pro-class-tab-panel pro-class-tab-panel-statistik">
                <div className="pro-class-soft-card pro-class-chart-card">
                  <h2 className="pro-class-soft-card-title">Emotionfördelning</h2>
                  <div className="pro-class-chart-wrap">
                    {labels.length > 0 ? (
                      <Doughnut data={doughnutData} options={chartOptions} />
                    ) : (
                      <EmptyState
                        title="Ingen data ännu"
                        description="Fördelning visas när elever börjar använda appen."
                        icon="📊"
                        className="empty-state-in-card"
                      />
                    )}
                  </div>
                </div>
                <div className="pro-class-soft-card pro-class-chart-card">
                  <h2 className="pro-class-soft-card-title">Veckotrend</h2>
                  <div className="pro-class-chart-wrap pro-class-chart-wrap--line">
                    <Line
                      data={{
                        labels: timeSeriesToShow.map((ts: any) =>
                          new Date(ts.date).toLocaleDateString('sv-SE', { weekday: 'short' })
                        ),
                        datasets: [{
                          label: 'Totalt per dag',
                          data: timeSeriesToShow.map((ts: any) =>
                            Object.values(ts.buckets || {}).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0)
                          ),
                          tension: 0.3,
                          borderColor: '#B7D9CF',
                          backgroundColor: 'rgba(183, 217, 207, 0.2)',
                        }],
                      }}
                      options={lineChartOptions}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Student drawer */}
      <div
        className={`pro-class-drawer-backdrop ${drawerStudent ? 'is-open' : ''}`}
        onClick={() => setDrawerStudent(null)}
        aria-hidden="true"
      />
      <aside
        className={`pro-class-drawer ${drawerStudent ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Elevdetaljer"
      >
        {drawerStudent && (
          <>
            <div className="pro-class-drawer-header">
              <h3>{drawerStudent.name}</h3>
              <button
                type="button"
                className="pro-class-ghost-btn"
                onClick={() => setDrawerStudent(null)}
                aria-label="Stäng"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="pro-class-drawer-body">
              <div className="pro-class-drawer-emoji" aria-hidden>{drawerStudent.emoji || '👤'}</div>
              {drawerStudent.summary && (
                <p className="pro-class-drawer-summary">Så mår eleven: {drawerStudent.summary}</p>
              )}
              <p className="pro-class-drawer-info">
                Läraren ser endast namn och att eleven finns i klassen. All statistik visas enbart ackumulerat för hela klassen – ingen individdata.
              </p>
            </div>
          </>
        )}
      </aside>

      <SchoolSubscriptionRequiredModal
        isOpen={showSchoolSubscriptionRequired}
        onClose={() => setShowSchoolSubscriptionRequired(false)}
        onChooseVerksamhet={() => {
          setShowSchoolSubscriptionRequired(false);
          navigate('/?show=verksamhet&context=school_linked');
        }}
      />
    </div>
  );
}
