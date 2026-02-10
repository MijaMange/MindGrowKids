import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import './styles/design-system.css'; // Import global design system
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { StatusPage } from './pages/Diagnostics/StatusPage';
import { DiagnosticsPage } from './pages/Diagnostics/DiagnosticsPage';
import { AuthProvider } from './auth/AuthContext';
import { AgeProvider } from './context/AgeContext';
import { AgeSelectionPage } from './pages/Onboarding/AgeSelectionPage';
import { SafeHubPage } from './pages/SafeHub/SafeHubPage';
import { TestHubPage } from './pages/TestHub/TestHubPage';
import { JourneySimplePage } from './pages/JourneySimple/JourneySimplePage';
import { DiarySimplePage } from './pages/DiarySimple/DiarySimplePage';
import { AvatarSimplePage } from './pages/AvatarSimple/AvatarSimplePage';
import { ProSimplePage } from './pages/ProSimple/ProSimplePage';
import { ProDiarySimplePage } from './pages/ProDiarySimple/ProDiarySimplePage';
import { ParentChildrenPage } from './pages/ParentChildren/ParentChildrenPage';
import { ChildLinkPage } from './pages/ChildLink/ChildLinkPage';
import { ParentDiarySimplePage } from './pages/ParentDiarySimple/ParentDiarySimplePage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { setMuted } from './utils/sound';
import { MobilePreview } from './components/MobilePreview/MobilePreview';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { OfflineBanner } from './components/OfflineBanner/OfflineBanner';
import { SkipToContent } from './components/SkipToContent/SkipToContent';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { syncQueuedCheckins } from './utils/offlineQueue';

// OLD COMPLEX ROUTES - COMMENTED OUT TO BYPASS HOOK ISSUES
// These components remain in the codebase but are not used for now
// import { GameLayout } from './layout/GameLayout';
// import { AppRoutes } from './components/AppRoutes/AppRoutes';

/** Megafon: ljud på = megafon, ljud av = megafon med kryss */
function MegaphoneIcon({ muted }: { muted: boolean }) {
  const size = 20;
  return (
    <span className="control-icon megaphone-icon" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8v8h2l5 4V4L7 8H5zM19 8l-2 4 2 4 2-4-2-4z" />
        {muted && <line x1="3" y1="21" x2="21" y2="3" strokeWidth="2.2" />}
      </svg>
    </span>
  );
}

function AppControls() {
  const location = useLocation();
  const [muted, setMute] = useState(false);
  const [calmMode, setCalmMode] = useState(() => {
    return localStorage.getItem('mgk-calm-mode') === '1';
  });

  function toggleMute() {
    setMute(!muted);
    setMuted(!muted);
  }

  function toggleCalmMode() {
    const newVal = !calmMode;
    setCalmMode(newVal);
    localStorage.setItem('mgk-calm-mode', newVal ? '1' : '0');
    document.body.setAttribute('data-calm', newVal ? '1' : '0');
  }

  useEffect(() => {
    document.body.setAttribute('data-calm', calmMode ? '1' : '0');
  }, [calmMode]);

  // Dölj på landningssida, hub, test-hub och app-routes så att inget skymmer
  if (location.pathname === '/' || location.pathname === '/hub' || location.pathname === '/test-hub' || location.pathname.startsWith('/app/')) {
    return null;
  }

  return (
    <div className="app-controls" role="group" aria-label="Ljud och visning">
      <button
        onClick={toggleCalmMode}
        className="control-btn control-btn-icon"
        title={calmMode ? 'Normal visning' : 'Lugn visning – mindre rörelser'}
        aria-pressed={calmMode}
      >
        <span className="control-icon calm-icon" aria-hidden="true">
          {calmMode ? '🌙' : '☀'}
        </span>
      </button>
      <button
        onClick={toggleMute}
        className="control-btn control-btn-icon"
        title={muted ? 'Ljud på' : 'Ljud av'}
        aria-pressed={muted}
      >
        <MegaphoneIcon muted={muted} />
      </button>
    </div>
  );
}

/** Sidor som ska ha grön gradient överallt – sätt body-klass så att vit bakgrund inte bryter */
const GREEN_PAGE_PATHS = [
  '/app/pro-simple',
  '/app/pro-diary-simple',
  '/hub',
  '/app/journey-simple',
  '/app/diary-simple',
  '/app/avatar-simple',
  '/app/parent-children',
  '/app/parent-diary-simple',
  '/app/settings',
];

function AppWrapper() {
  const location = useLocation();
  const isJourneyPage = location.pathname === '/app/journey-simple';
  const isGreenPage = GREEN_PAGE_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));

  useEffect(() => {
    if (isGreenPage) {
      document.body.classList.add('mg-green-page');
      return () => document.body.classList.remove('mg-green-page');
    }
  }, [isGreenPage]);

  return (
    <>
      <SkipToContent />
      {/* Dölj global offline-banner på känsloresan så det inte upplevs som felmeddelande */}
      {!isJourneyPage && <OfflineBanner />}
      <AppControls />
      <ErrorBoundary>
        <main id="main-content">
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/diag" element={<StatusPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />

          {/* Protected app routes - minimal, hook-safe version */}
          {/* Each route handles its own auth check to avoid RequireAuth timing issues */}
          {/* Complex pages wrapped individually to prevent one crash from breaking entire app */}
          <Route path="/hub" element={<SafeHubPage />} />
          <Route path="/test-hub" element={<Navigate to="/hub" replace />} />
          {/* Redirect gamla/alternativa sökvägar till rätt sidor – fixar felkoppling (känslo-knapp m.m.) */}
          <Route path="/app/dashboard" element={<Navigate to="/hub" replace />} />
          <Route path="/app/hub" element={<Navigate to="/hub" replace />} />
          <Route path="/app/journey" element={<Navigate to="/app/journey-simple" replace />} />
          <Route path="/app/diary" element={<Navigate to="/app/diary-simple" replace />} />
          <Route path="/app/avatar" element={<Navigate to="/app/avatar-simple" replace />} />
          <Route 
            path="/app/journey-simple" 
            element={
              <ErrorBoundary>
                <JourneySimplePage />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/app/diary-simple" 
            element={
              <ErrorBoundary>
                <DiarySimplePage />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/app/avatar-simple" 
            element={
              <ErrorBoundary>
                <AvatarSimplePage />
              </ErrorBoundary>
            } 
          />
          <Route path="/app/pro-simple" element={<ProSimplePage />} />
          <Route path="/app/pro-diary-simple" element={<ProDiarySimplePage />} />
          <Route path="/app/parent-children" element={<ParentChildrenPage />} />
          <Route path="/app/parent-diary-simple" element={<ParentDiarySimplePage />} />
          <Route path="/app/child-link" element={<ChildLinkPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
          <Route path="/app/onboarding/age" element={<AgeSelectionPage />} />

          {/* OLD COMPLEX ROUTES - COMMENTED OUT TO BYPASS HOOK ISSUES */}
          {/* These routes are disabled to avoid React error #310 */}
          {/* The components remain in the codebase but are not used for now */}
          {/* 
          <Route path="/app" element={<RequireAuth />}>
            <Route
              path="*"
              element={
                <GameLayout>
                  <AppRoutes />
                </GameLayout>
              }
            />
          </Route>
          */}

          {/* Mobile preview routes */}
          <Route path="/mobile" element={<MobilePreview />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </ErrorBoundary>
    </>
  );
}

function SyncWrapper() {
  const isOnline = useOnlineStatus();
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  // Sync queued checkins when coming online (only for child users)
  useEffect(() => {
    if (isOnline && user?.role === 'child' && !syncing) {
      setSyncing(true);
      syncQueuedCheckins()
        .then((result) => {
          if (result.needsAuth) {
            console.warn('[App] Needs re-authentication to sync checkins');
            // Could trigger re-login flow here if needed
          } else if (result.synced > 0) {
            console.log(`[App] Synced ${result.synced} checkin(s)`);
          }
        })
        .catch((err) => {
          console.error('[App] Error syncing checkins:', err);
        })
        .finally(() => {
          setSyncing(false);
        });
    }
  }, [isOnline, user?.role, syncing]);

  return null; // This component only handles side effects
}

export default function App() {
  return (
    <AuthProvider>
      <AgeProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <SyncWrapper />
          <AppWrapper />
        </BrowserRouter>
      </AgeProvider>
    </AuthProvider>
  );
}
