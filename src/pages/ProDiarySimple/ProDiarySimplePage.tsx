import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { AdultPageShell } from '../../components/AdultPageShell/AdultPageShell';
import { ClassDiaryContent } from '../../components/ClassDiaryContent';
import '../Diary/diary.css';

/**
 * ProDiarySimplePage - Klassdagbok för lärare (separat sida).
 * Använder samma ClassDiaryContent som översiktsfliken.
 */
export function ProDiarySimplePage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'pro') return <Navigate to="/hub" replace />;

  return (
    <AdultPageShell pillLabel="Lärarvy" title="Klassens dagbok">
      <ClassDiaryContent />
    </AdultPageShell>
  );
}


