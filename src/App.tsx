import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles/design-system.css'; // Import global design system
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { StatusPage } from './pages/Diagnostics/StatusPage';
import { DiagnosticsPage } from './pages/Diagnostics/DiagnosticsPage';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './components/RequireAuth/RequireAuth';
import { SafeHubPage } from './pages/SafeHub/SafeHubPage';
import { TestHubPage } from './pages/TestHub/TestHubPage';
import { JourneySimplePage } from './pages/JourneySimple/JourneySimplePage';
import { DiarySimplePage } from './pages/DiarySimple/DiarySimplePage';
import { AvatarSimplePage } from './pages/AvatarSimple/AvatarSimplePage';
import { ProSimplePage } from './pages/ProSimple/ProSimplePage';
import { ProDiarySimplePage } from './pages/ProDiarySimple/ProDiarySimplePage';
import { ParentChildrenPage } from './pages/ParentChildren/ParentChildrenPage';
import { ParentDiarySimplePage } from './pages/ParentDiarySimple/ParentDiarySimplePage';
import { setMuted } from './utils/sound';
import { MobilePreview } from './components/MobilePreview/MobilePreview';
import { useLocation } from 'react-router-dom';

// OLD COMPLEX ROUTES - COMMENTED OUT TO BYPASS HOOK ISSUES
// These components remain in the codebase but are not used for now
// import { GameLayout } from './layout/GameLayout';
// import { AppRoutes } from './components/AppRoutes/AppRoutes';

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

  // Hide controls on landing page, hub, and app routes
  if (location.pathname === '/' || location.pathname === '/hub' || location.pathname.startsWith('/app/')) {
    return null;
  }

  return (
    <div className="app-controls">
      <button
        onClick={toggleCalmMode}
        className="control-btn"
        title="Calm Mode - reducerar rörelser och färger"
      >
        {calmMode ? '🌙 Calm' : '☀️ Normal'}
      </button>
      <button onClick={toggleMute} className="control-btn">
        {muted ? '🔇 Ljud av' : '🔈 Ljud på'}
      </button>
    </div>
  );
}

function AppWrapper() {
  return (
    <>
      <AppControls />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/diag" element={<StatusPage />} />
        <Route path="/diagnostics" element={<DiagnosticsPage />} />

        {/* Protected app routes - minimal, hook-safe version */}
        {/* Each route handles its own auth check to avoid RequireAuth timing issues */}
        <Route path="/hub" element={<SafeHubPage />} />
        <Route path="/test-hub" element={<TestHubPage />} />
        <Route path="/app/journey-simple" element={<JourneySimplePage />} />
        <Route path="/app/diary-simple" element={<DiarySimplePage />} />
        <Route path="/app/avatar-simple" element={<AvatarSimplePage />} />
        <Route path="/app/pro-simple" element={<ProSimplePage />} />
        <Route path="/app/pro-diary-simple" element={<ProDiarySimplePage />} />
        <Route path="/app/parent-children" element={<ParentChildrenPage />} />
        <Route path="/app/parent-diary-simple" element={<ParentDiarySimplePage />} />

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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}
