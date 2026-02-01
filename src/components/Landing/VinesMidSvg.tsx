import { motion } from 'framer-motion';

/**
 * VinesMidSvg - Mid-layer vines that "draw in" using pathLength animation
 * Creates a sense of growth and life
 */
export function VinesMidSvg() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Main vine - left side */}
      <motion.path
        d="M50 250 Q80 200 100 150 Q120 100 140 80 Q160 60 180 50"
        stroke="url(#vineGradient1)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 2, ease: 'easeInOut', delay: 0.8 }}
      />
      
      {/* Secondary vine - right side */}
      <motion.path
        d="M350 250 Q320 200 300 150 Q280 100 260 80 Q240 60 220 50"
        stroke="url(#vineGradient2)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 2.2, ease: 'easeInOut', delay: 1 }}
      />
      
      {/* Small vine accents */}
      <motion.path
        d="M120 200 Q130 180 140 160"
        stroke="url(#vineGradient3)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.2 }}
      />
      
      <motion.path
        d="M280 200 Q270 180 260 160"
        stroke="url(#vineGradient3)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 1.3 }}
      />
      
      <defs>
        <linearGradient id="vineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3d6b1f" />
          <stop offset="100%" stopColor="#5a8f35" />
        </linearGradient>
        <linearGradient id="vineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d5016" />
          <stop offset="100%" stopColor="#4a7c2a" />
        </linearGradient>
        <linearGradient id="vineGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a7c2a" />
          <stop offset="100%" stopColor="#6ba048" />
        </linearGradient>
      </defs>
    </svg>
  );
}

