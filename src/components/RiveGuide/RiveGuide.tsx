import { useEffect, useRef, useState } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { motion } from 'framer-motion';
import './RiveGuide.css';

/**
 * RiveGuide - A subtle, premium Rive animation that enhances the "enter the jungle" feeling.
 * 
 * Reacts to user intent:
 * - idle: Default state
 * - hover: When Start button is hovered/focused
 * - confirm: When Start button is clicked
 * 
 * @param reactSignal - Current interaction state
 * @param reducedMotion - Whether user prefers reduced motion
 */
interface RiveGuideProps {
  reactSignal: 'idle' | 'hover' | 'confirm';
  reducedMotion: boolean;
}

// Configuration - Update these after exporting from Rive
// Place your .riv file in: public/rive/jungle-guide.riv
const RIVE_FILE = '/rive/jungle-guide.riv';
const STATE_MACHINE_NAME = 'State Machine 1'; // Update this to your state machine name
const INPUT_NAME = 'reactSignal'; // Update this to your input name

type RiveStatus = 'checking' | 'found' | 'missing' | 'corrupt' | 'loaded';

export function RiveGuide({ reactSignal, reducedMotion }: RiveGuideProps) {
  const [status, setStatus] = useState<RiveStatus>('checking');
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isDev = import.meta.env.DEV;

  // Precheck: Fetch the file first to verify it exists and is valid
  useEffect(() => {
    async function checkRiveFile() {
      try {
        console.log('[RiveGuide] Checking file:', RIVE_FILE);
        const response = await fetch(RIVE_FILE, { method: 'HEAD' });
        
        if (!response.ok) {
          if (response.status === 404) {
            console.warn('[RiveGuide] 404 not found:', RIVE_FILE);
            setStatus('missing');
            setErrorMessage('File not found');
            setHasError(true);
            return;
          }
          console.warn('[RiveGuide] HTTP error:', response.status, response.statusText);
          setStatus('missing');
          setErrorMessage(`HTTP ${response.status}`);
          setHasError(true);
          return;
        }

        // Check content-type (should be application/octet-stream or similar for .riv)
        // If it's text/html, Vite is returning index.html (SPA fallback) = file doesn't exist
        const contentType = response.headers.get('content-type') || '';
        const contentLength = response.headers.get('content-length');
        
        console.log('[RiveGuide] Response status:', response.status);
        console.log('[RiveGuide] Content-Type:', contentType);
        console.log('[RiveGuide] Content-Length:', contentLength);
        
        // Detect SPA fallback (Vite returns index.html when file doesn't exist)
        if (contentType.includes('text/html')) {
          console.warn('[RiveGuide] File not found - Vite returned index.html (SPA fallback)');
          console.warn('[RiveGuide] Expected file location: public/rive/jungle-guide.riv');
          setStatus('missing');
          setErrorMessage('File not found (SPA fallback)');
          setHasError(true);
          return;
        }
        
        // Verify it's a binary file (not HTML/JS)
        if (contentType && !contentType.includes('octet-stream') && !contentType.includes('application')) {
          console.warn('[RiveGuide] Unexpected Content-Type:', contentType);
          console.warn('[RiveGuide] Expected: application/octet-stream or similar');
        }
        
        console.log('[RiveGuide] File found and appears valid');
        setStatus('found');
      } catch (err) {
        console.error('[RiveGuide] Fetch error:', err);
        setStatus('missing');
        setErrorMessage('Network error');
        setHasError(true);
      }
    }

    checkRiveFile();
  }, []);

  // Try to use state machine first
  const { rive, RiveComponent } = useRive({
    src: status === 'found' ? RIVE_FILE : undefined, // Only load if file was found
    stateMachines: STATE_MACHINE_NAME,
    autoplay: !reducedMotion && status === 'found',
    onLoad: () => {
      console.log('[RiveGuide] Rive file loaded successfully');
      setIsLoaded(true);
      setHasError(false);
      setStatus('loaded');
    },
    onLoadError: (err: any) => {
      console.error('[RiveGuide] Rive load error:', err);
      
      // Determine error type
      if (status === 'found') {
        console.error('[RiveGuide] File loaded but failed to parse (likely corrupt export)');
        setStatus('corrupt');
        setErrorMessage('Corrupt file');
      } else {
        console.warn('[RiveGuide] File not found or network error');
        setStatus('missing');
        setErrorMessage('File missing');
      }
      
      setHasError(true);
    },
  });

  // Try to get state machine input
  const reactInput = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    INPUT_NAME,
    false
  );

  // Fallback: Use named animations if state machine is not available
  const [fallbackAnimations, setFallbackAnimations] = useState<string[]>([]);

  useEffect(() => {
    if (rive && !reactInput && status === 'loaded') {
      // State machine not found, try to use named animations
      const artboard = rive.artboard;
      if (artboard) {
        const anims = artboard.animationNames();
        setFallbackAnimations(anims);
        if (anims.length > 0) {
          console.warn(
            '[RiveGuide] State machine not found. Available animations:',
            anims
          );
          console.warn(
            '[RiveGuide] To use state machine:',
            '\n1. Open your .riv file in Rive editor',
            '\n2. Create a State Machine',
            '\n3. Add an Input (Boolean or Number) named:',
            INPUT_NAME,
            '\n4. Update STATE_MACHINE_NAME in RiveGuide.tsx'
          );
        }
      }
    }
  }, [rive, reactInput, status]);

  // Handle reactSignal changes
  useEffect(() => {
    if (reducedMotion || hasError || !isLoaded || status !== 'loaded') return;

    if (reactInput) {
      // Use state machine input
      if (reactSignal === 'hover') {
        reactInput.value = true;
      } else if (reactSignal === 'confirm') {
        reactInput.value = true;
        // Reset after animation
        setTimeout(() => {
          if (reactInput) reactInput.value = false;
        }, 500);
      } else {
        reactInput.value = false;
      }
    } else if (fallbackAnimations.length > 0 && rive) {
      // Fallback: Use named animations
      const animMap: Record<string, string> = {
        idle: 'idle',
        hover: 'hover',
        confirm: 'confirm',
      };

      const animName = animMap[reactSignal] || 'idle';
      if (fallbackAnimations.includes(animName)) {
        rive.play(animName);
      } else {
        // Try first available animation
        rive.play(fallbackAnimations[0]);
      }
    }
  }, [reactSignal, reactInput, reducedMotion, hasError, isLoaded, rive, fallbackAnimations, status]);

  // Dev badge - only in development
  const devBadgeText = 
    status === 'checking' ? 'Rive: Checking...' :
    status === 'found' ? 'Rive: Found' :
    status === 'loaded' ? 'Rive: ON' :
    status === 'corrupt' ? 'Rive: OFF (corrupt)' :
    'Rive: OFF (file missing)';

  // Render fallback SVG leaf buddy if Rive is not available
  if (hasError || status !== 'loaded' || reducedMotion) {
    return (
      <>
        {isDev && (
          <div className="rive-dev-badge" aria-live="polite">
            {devBadgeText}
          </div>
        )}
        <motion.div
          ref={containerRef}
          className="rive-guide-container rive-fallback"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <LeafBuddySvg reactSignal={reactSignal} reducedMotion={reducedMotion} />
        </motion.div>
      </>
    );
  }

  return (
    <>
      {isDev && (
        <div className="rive-dev-badge" aria-live="polite">
          {devBadgeText}
        </div>
      )}
      <div ref={containerRef} className="rive-guide-container" aria-hidden="true">
        <RiveComponent className="rive-guide-canvas" />
      </div>
    </>
  );
}

/**
 * LeafBuddySvg - Cohesive SVG fallback when Rive is not available
 * A friendly leaf buddy that reacts to user intent
 */
function LeafBuddySvg({ 
  reactSignal, 
  reducedMotion 
}: { 
  reactSignal: 'idle' | 'hover' | 'confirm';
  reducedMotion: boolean;
}) {
  const blinkAnimation = reducedMotion
    ? {}
    : {
        opacity: [0.7, 1, 0.7],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  const swayAnimation = reducedMotion
    ? {}
    : {
        rotate: [0, 2, -2, 1, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  const hoverAnimation = reactSignal === 'hover' && !reducedMotion
    ? { scale: 1.1, rotate: 5 }
    : {};

  const confirmAnimation = reactSignal === 'confirm' && !reducedMotion
    ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] }
    : {};

  return (
    <motion.svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="leaf-buddy-svg"
      animate={{
        ...blinkAnimation,
        ...swayAnimation,
        ...hoverAnimation,
        ...confirmAnimation,
      }}
      transition={
        reactSignal === 'confirm'
          ? { duration: 0.4, ease: 'easeOut' }
          : reactSignal === 'hover'
          ? { duration: 0.2, ease: 'easeOut' }
          : undefined
      }
    >
      {/* Main leaf body - friendly monstera-like shape */}
      <motion.path
        d="M100 40C80 40 65 50 60 65C55 80 58 95 68 105C78 115 92 120 100 120C108 120 122 115 132 105C142 95 145 80 140 65C135 50 120 40 100 40Z"
        fill="url(#leafGradient1)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      
      {/* Leaf details - fenestrations */}
      <ellipse cx="85" cy="70" rx="8" ry="12" fill="url(#leafGradient2)" opacity="0.6" />
      <ellipse cx="115" cy="75" rx="6" ry="10" fill="url(#leafGradient2)" opacity="0.5" />
      <ellipse cx="100" cy="90" rx="10" ry="15" fill="url(#leafGradient2)" opacity="0.4" />
      
      {/* Stem */}
      <motion.path
        d="M100 120L100 160"
        stroke="url(#stemGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      />
      
      {/* Small accent leaves */}
      <motion.circle
        cx="70"
        cy="100"
        r="12"
        fill="url(#leafGradient3)"
        opacity="0.6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
      <motion.circle
        cx="130"
        cy="110"
        r="10"
        fill="url(#leafGradient3)"
        opacity="0.5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      />
      
      {/* Eyes - friendly expression */}
      <motion.circle
        cx="90"
        cy="75"
        r="4"
        fill="#2d5016"
        animate={reactSignal === 'hover' ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      />
      <motion.circle
        cx="110"
        cy="75"
        r="4"
        fill="#2d5016"
        animate={reactSignal === 'hover' ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      />
      
      {/* Smile - appears on hover/confirm */}
      <motion.path
        d="M85 90 Q100 95 115 90"
        stroke="#2d5016"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: reactSignal !== 'idle' ? 1 : 0,
          opacity: reactSignal !== 'idle' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      <defs>
        <linearGradient id="leafGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5a8f35" />
          <stop offset="100%" stopColor="#4a7c2a" />
        </linearGradient>
        <linearGradient id="leafGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ba048" />
          <stop offset="100%" stopColor="#5a8f35" />
        </linearGradient>
        <linearGradient id="leafGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a7c2a" />
          <stop offset="100%" stopColor="#3d6b1f" />
        </linearGradient>
        <linearGradient id="stemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3d6b1f" />
          <stop offset="100%" stopColor="#2d5016" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}
