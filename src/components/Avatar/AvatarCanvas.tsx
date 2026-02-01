import './avatar.css';
import { AvatarData } from '../../state/useAvatarStore';

export function AvatarCanvas({
  data,
  size = 260,
}: {
  data: AvatarData;
  size?: number;
}) {
  const {
    bodyTone,
    hair,
    eye,
    eyeColor,
    mouth,
    outfitType,
    top,
    bottom,
    set,
    accessory,
    bg,
  } = data;

  return (
    <div className={`avatar-wrap bg-${bg}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        {/* Bakgrundsring */}
        <circle cx="100" cy="100" r="96" fill="url(#ring)" />
        <defs>
          <radialGradient id="ring" cx="50%" cy="45%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
          </radialGradient>
        </defs>

        {/* Kropp/huvud */}
        <g>
          <circle cx="100" cy="95" r="52" fill={bodyTone} />
          <rect x="70" y="140" width="60" height="34" rx="12" fill={bodyTone} />
        </g>

        {/* Hår */}
        {hair.style === 'short' && (
          <path d="M56,90 C58,58 142,58 144,90 C130,60 70,60 56,90Z" fill={hair.color} />
        )}
        {hair.style === 'bun' && (
          <>
            <circle cx="70" cy="64" r="14" fill={hair.color} />
            <circle cx="130" cy="64" r="14" fill={hair.color} />
            <path d="M55,92 C60,56 140,56 145,92Z" fill={hair.color} />
          </>
        )}
        {hair.style === 'curly' && (
          <path d="M54,88 C64,58 136,58 146,88 C140,66 60,66 54,88Z" fill={hair.color} />
        )}
        {hair.style === 'afro' && <circle cx="100" cy="76" r="32" fill={hair.color} />}
        {hair.style === 'long' && (
          <path d="M56,86 C60,56 140,56 144,86 L144,132 Q120,156 80,156 L56,132Z" fill={hair.color} />
        )}
        {hair.style === 'hijab' && (
          <path d="M50,90 Q100,40 150,90 L150,150 Q100,180 50,150Z" fill={hair.color} />
        )}

        {/* Ögon */}
        {eye === 'round' && (
          <>
            <circle cx="82" cy="98" r="6" fill={eyeColor} />
            <circle cx="118" cy="98" r="6" fill={eyeColor} />
          </>
        )}
        {eye === 'smile' && (
          <>
            <path
              d="M74,96 Q82,92 90,96"
              stroke={eyeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M110,96 Q118,92 126,96"
              stroke={eyeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Mun */}
        {mouth === 'smile' && (
          <path
            d="M82,118 Q100,130 118,118"
            stroke="#7a3"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {mouth === 'open' && <ellipse cx="100" cy="120" rx="10" ry="6" fill="#b44" />}

        {/* Kläder */}
        {outfitType === 'set' ? (
          // overall/klänning
          <path d="M80,140 L120,140 L130,170 L70,170Z" fill="#9ccfc2" />
        ) : (
          <>
            {/* top */}
            {top === 'tee' && <path d="M75,142 L125,142 L125,160 L75,160Z" fill="#86b7ee" />}
            {top === 'hoodie' && (
              <path d="M75,138 L125,138 L130,160 L70,160Z" fill="#c9a3e8" />
            )}
            {/* bottom */}
            {bottom === 'shorts' && (
              <>
                <rect x="75" y="160" width="20" height="16" rx="4" fill="#86b7ee" />
                <rect x="105" y="160" width="20" height="16" rx="4" fill="#86b7ee" />
              </>
            )}
            {bottom === 'skirt' && (
              <path d="M72,160 L128,160 L120,176 L80,176Z" fill="#f4c36a" />
            )}
          </>
        )}

        {/* Accessoar */}
        {accessory === 'glasses' && (
          <>
            <circle cx="82" cy="98" r="10" fill="none" stroke="#333" strokeWidth="3" />
            <circle cx="118" cy="98" r="10" fill="none" stroke="#333" strokeWidth="3" />
            <line x1="92" y1="98" x2="108" y2="98" stroke="#333" strokeWidth="3" />
          </>
        )}
        {accessory === 'cap' && (
          <path d="M60,86 Q100,66 140,86 L140,92 L60,92Z" fill="#2f4858" />
        )}
        {accessory === 'headphones' && (
          <>
            <path d="M68,78 Q100,60 132,78" stroke="#333" strokeWidth="6" fill="none" />
            <rect x="60" y="82" width="16" height="18" rx="6" fill="#333" />
            <rect x="124" y="82" width="16" height="18" rx="6" fill="#333" />
          </>
        )}
        {accessory === 'flower' && <circle cx="66" cy="82" r="6" fill="#f06" />}
      </svg>
    </div>
  );
}

