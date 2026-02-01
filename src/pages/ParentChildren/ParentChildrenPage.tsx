import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import '../Diary/diary.css';

interface LinkedChild {
  id: string;
  name: string;
}

/**
 * ParentChildrenPage - Lista över kopplade barn för föräldrar
 * 
 * Visar alla barn som är kopplade till föräldern och möjlighet att länka nya barn.
 */
export function ParentChildrenPage() {
  // CRITICAL: All hooks must be called at the top
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [linkCode, setLinkCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'parent') return;

    async function load() {
      try {
        // Hämta kopplade barn (för nu använder vi childId från user, men kan utökas)
        // TODO: Skapa API endpoint /api/parent/my-children
        const res = await fetch('/api/parent/my-children', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setChildren(data.children || []);
        } else {
          // Fallback: försök hämta från user.childId om det finns
          if ((user as any).childId) {
            // Hämta barnets info
            const childRes = await fetch(`/api/children/${(user as any).childId}`, {
              credentials: 'include',
            });
            if (childRes.ok) {
              const childData = await childRes.json();
              setChildren([{ id: childData.id, name: childData.name }]);
            }
          }
        }
      } catch (err) {
        console.error('Kunde inte ladda barn:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  async function handleLink() {
    if (!linkCode.trim()) {
      alert('Ange PIN eller länkkod');
      return;
    }

    try {
      const isLinkCode = linkCode.length === 6 && /^\d+$/.test(linkCode);
      const body = isLinkCode ? { linkCode } : { pin: linkCode };

      const r = await fetch('/api/pin/link', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (r.ok) {
        alert('Kopplat!');
        setLinkCode('');
        // Ladda om listan
        window.location.reload();
      } else {
        const d = await r.json();
        alert(d.message || d.error || 'Kunde inte koppla. Kontrollera koden.');
      }
    } catch (err) {
      console.error('Link error:', err);
      alert('Kunde inte koppla. Försök igen.');
    }
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'parent') {
    return <Navigate to="/test-hub" replace />;
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

      <div className="card" style={{ marginBottom: '16px' }}>
        <h2>Mina barn</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Här ser du alla barn som är kopplade till ditt konto.
        </p>
      </div>

      {/* Länka nytt barn */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <h3>Länka nytt barn</h3>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input
            type="text"
            value={linkCode}
            onChange={(e) => setLinkCode(e.target.value)}
            placeholder="Länkkod (6 siffror) eller PIN (4 siffror)"
            maxLength={6}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          />
          <button
            onClick={handleLink}
            style={{
              padding: '10px 24px',
              background: '#11998e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Länka
          </button>
        </div>
        <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>
          Ange din barns permanenta länkkod (6 siffror) eller temporär PIN (4 siffror, giltig 5 minuter).
        </small>
      </div>

      {/* Lista över kopplade barn */}
      {loading ? (
        <div className="card">
          <p>Laddar...</p>
        </div>
      ) : children.length === 0 ? (
        <div className="card">
          <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
            Inga barn kopplade ännu. Använd länkkoden ovan för att koppla ditt första barn.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {children.map((child) => (
            <div
              key={child.id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/app/parent-diary-simple?childId=${child.id}`)}
            >
              <div>
                <h3 style={{ margin: 0 }}>{child.name}</h3>
                <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                  Klicka för att se dagbok
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/parent-diary-simple?childId=${child.id}`);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#11998e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                Se dagbok →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


