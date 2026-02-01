import { Routes, Route, Navigate } from 'react-router-dom';
import { ChildPage } from '../../pages/Child/ChildPage';
import { DashboardPage } from '../../pages/Dashboard/DashboardPage';
import { ParentPage } from '../../pages/Parent/ParentPage';
import { ProPage } from '../../pages/Pro/ProPage';
import { ChildDiary } from '../../pages/Diary/ChildDiary';
import { MePage } from '../../pages/Me/MePage';
import { AvatarEditorPage } from '../../pages/Avatar/AvatarEditorPage';
import { JourneyPage } from '../../pages/Journey/JourneyPage';
import FeelingJourney from '../../pages/Journey/FeelingJourney';

/**
 * AppRoutes - All routes under /app/*
 * 
 * These routes are already protected by RequireAuth wrapper
 * so we can safely render them here
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="hub" element={<DashboardPage />} />
      <Route path="child" element={<ChildPage />} />
      <Route path="parent" element={<ParentPage />} />
      <Route path="pro" element={<ProPage />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="diary" element={<ChildDiary />} />
      <Route path="avatar" element={<AvatarEditorPage />} />
      <Route path="me" element={<MePage />} />
      <Route path="journey" element={<JourneyPage />} />
      <Route path="journey-old" element={<FeelingJourney />} />
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}

