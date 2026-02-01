import { LogoIcon } from './LogoIcon';
import './MindGrowLogo.css';

type MindGrowLogoProps = {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg'; // affects both icon and text size
  withWordmark?: boolean; // default true, false = icon only
  className?: string;
};

/**
 * MindGrowLogo - Complete logo with icon + wordmark
 * 
 * Combines the cubic LogoIcon with the "MINDGROW" wordmark.
 * Used for branding consistency across the app.
 */
export function MindGrowLogo({
  variant = 'dark',
  size = 'md',
  withWordmark = true,
  className = '',
}: MindGrowLogoProps) {
  // Text size mapping
  const textSizeMap = {
    sm: '14px',
    md: '18px',
    lg: '32px', // Increased from 24px to better match the 72px icon
  };

  const textSize = textSizeMap[size];

  // Color mapping based on variant
  const textColor = variant === 'dark' ? '#FDFCF9' : '#0A2F35';

  return (
    <div className={`mindgrow-logo mindgrow-logo-${size} ${className}`}>
      <LogoIcon variant={variant} size={size} />
      {withWordmark && (
        <span
          className="mindgrow-wordmark"
          style={{
            fontSize: textSize,
            color: textColor,
          }}
        >
          MINDGROW
        </span>
      )}
    </div>
  );
}

