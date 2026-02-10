import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * LoadingSpinner - Calm, minimal loading indicator
 * 
 * Features:
 * - Calm dot animation (respects prefers-reduced-motion)
 * - Accessible: role="status", aria-live="polite"
 * - Customizable label text
 * - Size variants: sm, md, lg
 * 
 * Usage:
 * <LoadingSpinner />
 * <LoadingSpinner label="Laddar data..." />
 * <LoadingSpinner size="lg" label="Sparar..." />
 */
export function LoadingSpinner({ 
  label = 'Laddar…', 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={`loading-spinner loading-spinner-${size} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="loading-spinner-dots" aria-hidden="true">
        <span className="loading-spinner-dot" />
        <span className="loading-spinner-dot" />
        <span className="loading-spinner-dot" />
      </div>
      {label && (
        <span className="loading-spinner-label">{label}</span>
      )}
    </div>
  );
}
