import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Catches React errors and displays a calm fallback UI
 * 
 * Features:
 * - Catches runtime errors in child component tree
 * - Shows calm fallback UI consistent with design system
 * - Provides "Försök igen" (retry) and "Tillbaka till hubben" (navigate home) buttons
 * - Accessible markup with role="alert" and keyboard navigation
 * - Optional error details in development mode
 */
class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in all environments
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
    if (!import.meta.env.DEV) {
      // Example: sendErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <ErrorFallbackUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorFallbackUI - The fallback UI component
 * 
 * This is a functional component so it can use hooks (useNavigate, useAuth)
 */
interface ErrorFallbackUIProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

function ErrorFallbackUI({ error, errorInfo, onReset }: ErrorFallbackUIProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDetails, setShowDetails] = React.useState(false);
  const isDevelopment = import.meta.env.DEV;

  function handleGoHome() {
    // Navigate to hub if logged in, else to landing page
    if (user) {
      navigate('/hub', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
    // Reset error boundary after navigation
    onReset();
  }

  function handleRetry() {
    // Reset error boundary and reload current route
    onReset();
    // Force a re-render by navigating to current location
    window.location.reload();
  }

  function handleCopyError() {
    if (!error || !errorInfo) return;
    
    const errorText = `
Error: ${error.toString()}
Stack: ${error.stack || 'No stack trace'}
Component Stack: ${errorInfo.componentStack || 'No component stack'}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      alert('Felinformation kopierad till urklipp');
    }).catch(() => {
      // Fallback if clipboard API fails
      console.log('Error details:', errorText);
      alert('Kunde inte kopiera. Felinformation finns i konsolen.');
    });
  }

  return (
    <div className="error-boundary-container" role="alert">
      {/* Breathing background gradient - same as other pages */}
      <div className="error-boundary-bg-gradient" aria-hidden="true" />

      <div className="error-boundary-content">
        <h1 className="error-boundary-title" tabIndex={-1}>
          Oops, något gick fel
        </h1>
        
        <p className="error-boundary-message">
          Vi beklagar, men något oväntat hände. Du kan försöka igen eller gå tillbaka till startsidan.
        </p>

        <div className="error-boundary-actions">
          <button
            className="error-boundary-button error-boundary-button-primary"
            onClick={handleRetry}
            autoFocus
          >
            Försök igen
          </button>
          
          <button
            className="error-boundary-button error-boundary-button-secondary"
            onClick={handleGoHome}
          >
            Tillbaka till hubben
          </button>
        </div>

        {/* Development-only error details */}
        {isDevelopment && error && (
          <details className="error-boundary-details">
            <summary
              className="error-boundary-details-summary"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Dölj' : 'Visa'} felinformation (endast utveckling)
            </summary>
            
            {showDetails && (
              <div className="error-boundary-details-content">
                <div className="error-boundary-details-section">
                  <strong>Felmeddelande:</strong>
                  <pre className="error-boundary-pre">{error.toString()}</pre>
                </div>
                
                {error.stack && (
                  <div className="error-boundary-details-section">
                    <strong>Stack trace:</strong>
                    <pre className="error-boundary-pre">{error.stack}</pre>
                  </div>
                )}
                
                {errorInfo?.componentStack && (
                  <div className="error-boundary-details-section">
                    <strong>Component stack:</strong>
                    <pre className="error-boundary-pre">{errorInfo.componentStack}</pre>
                  </div>
                )}
                
                <button
                  className="error-boundary-button error-boundary-button-small"
                  onClick={handleCopyError}
                >
                  Kopiera felinformation
                </button>
              </div>
            )}
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * ErrorBoundary - Wrapper component that provides the ErrorBoundaryClass
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export function ErrorBoundary({ children, fallback, onReset }: Props) {
  return (
    <ErrorBoundaryClass fallback={fallback} onReset={onReset}>
      {children}
    </ErrorBoundaryClass>
  );
}
