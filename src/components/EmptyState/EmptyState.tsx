import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * EmptyState - Reusable empty state component
 * 
 * Features:
 * - Calm layout consistent with design system
 * - Accessible heading structure
 * - Optional icon, action button
 * - Keyboard accessible buttons
 * 
 * Usage:
 * <EmptyState 
 *   title="Inga anteckningar ännu"
 *   description="När du börjar använda appen visas dina anteckningar här."
 * />
 * 
 * <EmptyState 
 *   title="Inga barn länkade"
 *   description="Länka ditt första barn via PIN eller länkkod."
 *   icon="👨‍👩‍👧"
 *   actionLabel="Länka ett barn"
 *   onAction={() => scrollToForm()}
 * />
 */
export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`} role="status" aria-live="polite">
      {icon && (
        <div className="empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button
          className="empty-state-action"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
