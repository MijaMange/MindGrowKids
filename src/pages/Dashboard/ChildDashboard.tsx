import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Logo } from '../../components/Logo/Logo';
import './ChildDashboard.css';

/**
 * ChildDashboard - Intuitive, game-like dashboard
 * 
 * Design principles:
 * - Minimal text: only greeting and question
 * - Logo as landmark, not navigation
 * - Cards as choices, not features
 * - No instructions or explanations
 * - Invite exploration without explaining
 */
export function ChildDashboard() {
  // CRITICAL: All hooks must be called at the top, before any conditional returns
  // This ensures hooks are always called in the same order, preventing React error #310
  // Hook 1: useNavigate
  const navigate = useNavigate();
  // Hook 2: useAuth
  const { user, logout } = useAuth();
  
  // Safety check - if no user, return null AFTER all hooks are called
  // This prevents rendering when user is null (shouldn't happen, but safety first)
  if (!user) {
    return null;
  }

  const actions = [
    {
      id: 'feel',
      title: 'Hur känner jag mig idag?',
      emoji: '💭',
      path: '/journey',
      color: '#2e7d32', // Tydligare grön
    },
    {
      id: 'days',
      title: 'Mina dagar',
      emoji: '📅',
      path: '/diary',
      color: '#1976d2', // Tydligare blå
    },
    {
      id: 'avatar',
      title: 'Jag',
      emoji: '🧑',
      path: '/avatar',
      color: '#f57c00', // Tydligare orange
    },
  ];

  return (
    <div className="child-dashboard">
      {/* Logo as landmark */}
      <div className="child-dashboard-logo">
        <Logo size="lg" />
      </div>

      {/* Minimal greeting */}
      <div className="child-dashboard-header">
        <h1>Hej {user?.name || 'där'}! 👋</h1>
        <p className="child-dashboard-question">Vad vill du göra idag?</p>
      </div>

      {/* Action cards - choices, not features */}
      <div className="child-dashboard-actions">
        {actions.map((action) => (
          <button
            key={action.id}
            className="child-action-card"
            onClick={() => navigate(action.path)}
            style={{ '--action-color': action.color } as React.CSSProperties}
          >
            <div className="child-action-emoji">{action.emoji}</div>
            <div className="child-action-title">{action.title}</div>
          </button>
        ))}
      </div>

      {/* Logout button */}
      <div className="child-dashboard-logout">
        <button
          className="child-logout-btn"
          onClick={async () => {
            await logout();
            navigate('/');
          }}
        >
          Logga ut
        </button>
      </div>
    </div>
  );
}

