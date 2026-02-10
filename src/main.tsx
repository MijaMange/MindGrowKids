import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/theme.css';

/** Fångar kraschar som annars ger vit sida – visar synligt felmeddelande */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Root] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#f6fbf8',
            color: '#1d2b24',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
          role="alert"
        >
          <h1 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Något gick fel</h1>
          <p style={{ marginBottom: 16, maxWidth: 400 }}>
            Sidan kunde inte laddas. Öppna utvecklarverktyget (F12) och titta under fliken Console för felmeddelanden.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 600,
              background: '#12a15c',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            Ladda om sidan
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);

