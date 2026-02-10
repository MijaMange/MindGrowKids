import { motion } from 'framer-motion';
import { LogoIcon } from './LogoIcon';
import './MindGrowLogo.css';

type MindGrowLogoProps = {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg'; // affects both icon and text size
  withWordmark?: boolean; // default true, false = icon only
  className?: string;
  animateLetters?: boolean; // if true, animate each letter with stagger
  prefersReducedMotion?: boolean; // disable animation if true
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
  animateLetters = false,
  prefersReducedMotion = false,
}: MindGrowLogoProps) {
  // Text size mapping
  const textSizeMap = {
    sm: '14px',
    md: '18px',
    lg: '32px', // Increased from 24px to better match the 72px icon
  };

  const textSize = textSizeMap[size];

  // Color mapping: dark = white text on green; light = dark text on light bg
  const textColor = variant === 'dark' ? '#FFFFFF' : '#0A2F35';

  // Split wordmark into letters for animation
  const wordmark = 'MINDGROW';
  const letters = wordmark.split('');

  // Animation variants for letter-by-letter animation
  const letterVariants = {
    initial: { 
      opacity: 0, 
      x: -20, // Slide in from left
      y: 8, // Slight downward offset for diagonal feel
    },
    animate: (i: number) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for soft, calm feel
        delay: i * 0.05, // Stagger: 0.05s between each letter
      },
    }),
  };

  // Icon animation (subtle fade-in, slightly before letters)
  const iconVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: animateLetters && !prefersReducedMotion ? 0.1 : 0,
      },
    },
  };

  return (
    <div className={`mindgrow-logo mindgrow-logo-${size} ${className}`}>
      {animateLetters && !prefersReducedMotion ? (
        <motion.div
          initial="initial"
          animate="animate"
          variants={iconVariants}
        >
          <LogoIcon variant={variant} size={size} />
        </motion.div>
      ) : (
        <LogoIcon variant={variant} size={size} />
      )}
      {withWordmark && (
        <span
          className="mindgrow-wordmark"
          style={{
            fontSize: textSize,
            color: textColor,
          }}
        >
          {animateLetters && !prefersReducedMotion ? (
            // Animate each letter individually
            letters.map((letter, index) => (
              <motion.span
                key={index}
                custom={index}
                initial="initial"
                animate="animate"
                variants={letterVariants}
                style={{ display: 'inline-block' }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))
          ) : (
            // Static wordmark (no animation)
            wordmark
          )}
        </span>
      )}
    </div>
  );
}

