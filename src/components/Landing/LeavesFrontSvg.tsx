/**
 * LeavesFrontSvg - Foreground leaves that frame the card
 * These overlap the card edges to create a "portal" effect
 */
export function LeavesFrontSvg() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Fern-like leaf - top left, overlaps card */}
      <path
        d="M60 20C55 15 50 12 45 12C40 12 35 14 32 18C29 22 28 27 30 32C32 37 36 41 41 42C46 43 51 41 54 37C57 33 58 28 60 20Z"
        fill="url(#frontGradient1)"
        opacity="0.7"
      />
      <path
        d="M50 35L45 50L55 50L50 35Z"
        fill="url(#frontGradient1)"
        opacity="0.6"
      />
      <path
        d="M45 50L40 65L50 65L45 50Z"
        fill="url(#frontGradient1)"
        opacity="0.5"
      />
      
      {/* Monstera leaf - top right, overlaps card */}
      <path
        d="M340 30C345 25 350 22 355 22C360 22 365 24 368 28C371 32 372 37 370 42C368 47 364 51 359 52C354 53 349 51 346 47C343 43 342 38 340 30Z"
        fill="url(#frontGradient2)"
        opacity="0.7"
      />
      <path
        d="M350 45L345 60L355 60L350 45Z"
        fill="url(#frontGradient2)"
        opacity="0.6"
      />
      <path
        d="M355 60L360 75L370 75L365 60L355 60Z"
        fill="url(#frontGradient2)"
        opacity="0.5"
      />
      
      {/* Large tropical leaf - bottom left, overlaps card */}
      <path
        d="M40 240C35 230 30 220 30 210C30 200 35 195 42 195C49 195 55 200 58 207C61 214 61 222 58 229C55 236 48 240 40 240Z"
        fill="url(#frontGradient3)"
        opacity="0.65"
      />
      <path
        d="M50 220L45 235L55 235L50 220Z"
        fill="url(#frontGradient3)"
        opacity="0.55"
      />
      
      {/* Large tropical leaf - bottom right, overlaps card */}
      <path
        d="M360 250C365 240 370 230 370 220C370 210 365 205 358 205C351 205 345 210 342 217C339 224 339 232 342 239C345 246 352 250 360 250Z"
        fill="url(#frontGradient4)"
        opacity="0.65"
      />
      <path
        d="M350 230L345 245L355 245L350 230Z"
        fill="url(#frontGradient4)"
        opacity="0.55"
      />
      
      {/* Small accent leaves */}
      <ellipse cx="80" cy="100" rx="12" ry="18" fill="url(#frontGradient5)" opacity="0.5" />
      <ellipse cx="320" cy="180" rx="10" ry="15" fill="url(#frontGradient5)" opacity="0.45" />
      
      <defs>
        <linearGradient id="frontGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a7c2a" />
          <stop offset="100%" stopColor="#6ba048" />
        </linearGradient>
        <linearGradient id="frontGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5a8f35" />
          <stop offset="100%" stopColor="#7ab055" />
        </linearGradient>
        <linearGradient id="frontGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3d6b1f" />
          <stop offset="100%" stopColor="#5a8f35" />
        </linearGradient>
        <linearGradient id="frontGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a7c2a" />
          <stop offset="100%" stopColor="#6ba048" />
        </linearGradient>
        <linearGradient id="frontGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5a8f35" />
          <stop offset="100%" stopColor="#7ab055" />
        </linearGradient>
      </defs>
    </svg>
  );
}



