import './LogoIcon.css';

type LogoIconProps = {
  variant?: 'light' | 'dark'; // default 'dark' for use on green background
  size?: 'sm' | 'md' | 'lg'; // maps to SVG width/height: e.g. 32, 48, 72
  className?: string;
};

/**
 * LogoIcon - The cubic line logo with eye/leaf + heart
 * 
 * Symbol represents: eye (seeing/awareness) + seed (growth) + heart (feeling inward)
 * The geometric form suggests both looking outward and growing inward.
 */
export function LogoIcon({ variant = 'dark', size = 'md', className = '' }: LogoIconProps) {
  // Size mapping
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 72,
  };

  const svgSize = sizeMap[size];

  // Color mapping based on variant
  const colors = {
    light: {
      stroke: '#0A2F35',
      fill: '#00B06D',
    },
    dark: {
      stroke: '#FDFCF9',
      fill: '#8CF0C0',
    },
  };

  const color = colors[variant];

  return (
    <svg
      viewBox="0 0 300 300"
      width={svgSize}
      height={svgSize}
      className={`logo-icon logo-icon-${size} ${className}`}
      aria-label="MindGrow logo"
    >
      {/* Outer rounded square outline */}
      <rect
        x="20"
        y="20"
        width="260"
        height="260"
        rx="50"
        stroke={color.stroke}
        strokeWidth="16"
        fill="none"
      />

      {/* Eye/leaf outline */}
      <path
        d="M75 150 C110 95 190 95 225 150 C190 205 110 205 75 150 Z"
        stroke={color.stroke}
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Heart core (smaller, centered) */}
      <path
        d="M150 138 C144 128 132 128 132 145 C132 160 150 174 150 174 C150 174 168 160 168 145 C168 128 156 128 150 138 Z"
        fill={color.fill}
      />
    </svg>
  );
}


