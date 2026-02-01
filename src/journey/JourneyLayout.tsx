import { useNavigate } from 'react-router-dom';
import AnimatedAvatar from './avatar/AnimatedAvatar';
import { ProgressDots } from './ui/ProgressDots';
import { useJourney } from './JourneyStore';

export default function JourneyLayout({
  children,
  stepCount,
}: {
  children: React.ReactNode;
  stepCount: number;
}) {
  const navigate = useNavigate();
  const step = useJourney((s) => s.step);
  const { prev, next } = useJourney.getState();

  function handleBack() {
    if (step === 0) {
      // Om vi är på första steget, gå tillbaka till dashboard
      navigate('/dashboard');
    } else {
      // Annars gå tillbaka till föregående steg
      prev();
    }
  }

  return (
    <div style={{ minHeight: '100svh', background: 'transparent', padding: 'clamp(12px,3vw,24px)  clamp(12px,3vw,24px) 100px clamp(12px,3vw,24px)', position: 'relative', zIndex: 1 }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          padding: '8px 0',
          zIndex: 5,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          marginBottom: '8px',
        }}
      >
        <button aria-label="Tillbaka" onClick={handleBack} className="nav-btn">
          ← Tillbaka
        </button>
        <div style={{ opacity: 0.7, fontSize: 14 }}>Steg {step + 1} / {stepCount}</div>
        <button aria-label="Nästa" onClick={() => useJourney.getState().next()} className="nav-btn">
          Nästa →
        </button>
      </div>

      <div style={{ display: 'grid', placeItems: 'center', gap: 18, paddingTop: 'clamp(20px, 5vw, 40px)', position: 'relative', zIndex: 1 }}>
        <AnimatedAvatar />
        <ProgressDots total={stepCount} active={useJourney((s) => s.step)} />
        <div style={{ width: 'min(96vw, 960px)', position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

