/**
 * LeavesBackSvg - Background layer leaves (monstera-like, large, blurred)
 * These create depth and atmosphere
 */
export function LeavesBackSvg() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Large Monstera-like leaf - left */}
      <path
        d="M20 80C20 60 35 45 50 45C65 45 80 50 90 65C100 80 105 100 100 120C95 140 85 155 70 160C55 165 40 160 30 145C20 130 20 110 20 80Z"
        fill="url(#backGradient1)"
        opacity="0.4"
      />
      {/* Large Monstera-like leaf - right */}
      <path
        d="M380 100C380 80 365 65 350 65C335 65 320 70 310 85C300 100 295 120 300 140C305 160 315 175 330 180C345 185 360 180 370 165C380 150 380 130 380 100Z"
        fill="url(#backGradient2)"
        opacity="0.35"
      />
      {/* Medium leaf - center back */}
      <path
        d="M180 40C180 30 190 25 200 25C210 25 220 28 225 35C230 42 232 52 230 62C228 72 222 80 215 82C208 84 200 82 195 75C190 68 180 58 180 40Z"
        fill="url(#backGradient3)"
        opacity="0.3"
      />
      <defs>
        <linearGradient id="backGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d5016" />
          <stop offset="100%" stopColor="#4a7c2a" />
        </linearGradient>
        <linearGradient id="backGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3d0f" />
          <stop offset="100%" stopColor="#3d6b1f" />
        </linearGradient>
        <linearGradient id="backGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d5016" />
          <stop offset="100%" stopColor="#5a8f35" />
        </linearGradient>
      </defs>
    </svg>
  );
}



