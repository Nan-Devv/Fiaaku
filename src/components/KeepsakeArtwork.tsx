import React from 'react';

interface KeepsakeArtworkProps {
  variant: 'meadow' | 'silhouette' | 'bouquet' | 'lantern' | 'cinema';
  title: string;
}

export const KeepsakeArtwork: React.FC<KeepsakeArtworkProps> = ({ variant, title }) => {
  if (variant === 'meadow') {
    return (
      <svg
        viewBox="0 0 400 500"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="artMeadowSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="55%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <radialGradient id="artMeadowSun" cx="72%" cy="24%" r="42%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="500" fill="url(#artMeadowSky)" />
        <rect width="400" height="500" fill="url(#artMeadowSun)" />
        <path
          d="M0 365 Q120 330 245 360 T400 345 L400 500 L0 500 Z"
          fill="#65A30D"
          opacity="0.82"
        />
        <path d="M0 405 Q170 375 400 412 L400 500 L0 500 Z" fill="#3F6212" />
        {[72, 148, 224, 305, 355].map((x, idx) => {
          const y = 325 + (idx % 2) * 24;
          const r = 24 + (idx % 3) * 4;
          return (
            <g key={x}>
              <path
                d={`M${x} ${y} Q${x - 6} 415 ${x + 3} 495`}
                stroke="#365314"
                strokeWidth="4.5"
                fill="none"
              />
              <g transform={`translate(${x}, ${y})`}>
                {Array.from({ length: 14 }).map((_, p) => (
                  <ellipse
                    key={p}
                    cx="0"
                    cy={-r * 0.92}
                    rx={r * 0.24}
                    ry={r * 0.62}
                    fill="#FACC15"
                    transform={`rotate(${(p * 360) / 14})`}
                  />
                ))}
                <circle r={r * 0.48} fill="#451A03" />
              </g>
            </g>
          );
        })}
      </svg>
    );
  }

  if (variant === 'silhouette') {
    return (
      <svg
        viewBox="0 0 400 500"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="artSilSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="48%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill="url(#artSilSky)" />
        <circle cx="200" cy="240" r="88" fill="#FFFBEB" opacity="0.88" />
        <circle cx="200" cy="240" r="132" fill="#FEF08A" opacity="0.28" />
        <path d="M0 378 Q200 355 400 385 L400 500 L0 500 Z" fill="#451A03" />
        <g fill="#2C1205">
          <circle cx="176" cy="316" r="14" />
          <path d="M158 378 C158 340, 194 340, 194 378 Z" />
          <circle cx="222" cy="322" r="13" />
          <path d="M204 378 C204 344, 240 344, 240 378 Z" />
          <path d="M188 355 Q200 348 212 355" stroke="#2C1205" strokeWidth="6" fill="none" />
        </g>
      </svg>
    );
  }

  if (variant === 'bouquet') {
    return (
      <svg
        viewBox="0 0 400 500"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="artBouquetBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#F7E8C8" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill="url(#artBouquetBg)" />
        <rect
          x="22"
          y="22"
          width="356"
          height="456"
          rx="18"
          fill="none"
          stroke="#C68A1E"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        {/* Paper Wrap Cone */}
        <polygon points="135,280 265,280 205,445 195,445" fill="#E7D3AE" stroke="#B45309" strokeWidth="1.5" />
        <path d="M150 325 Q200 340 250 325" stroke="#C68A1E" strokeWidth="4" fill="none" />
        {/* Bouquet Blooms */}
        {[
          { x: 155, y: 215, r: 34 },
          { x: 245, y: 218, r: 32 },
          { x: 200, y: 168, r: 42 },
          { x: 200, y: 242, r: 30 }
        ].map((b, i) => (
          <g key={i} transform={`translate(${b.x}, ${b.y})`}>
            {Array.from({ length: 16 }).map((_, p) => (
              <ellipse
                key={p}
                cx="0"
                cy={-b.r * 0.85}
                rx={b.r * 0.22}
                ry={b.r * 0.56}
                fill={i % 2 === 0 ? '#F59E0B' : '#FACC15'}
                transform={`rotate(${(p * 360) / 16})`}
              />
            ))}
            <circle r={b.r * 0.44} fill="#451A03" />
          </g>
        ))}
      </svg>
    );
  }

  if (variant === 'lantern') {
    return (
      <svg
        viewBox="0 0 400 500"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="artLanternSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#451A03" />
            <stop offset="55%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <radialGradient id="artLanternGlow" cx="50%" cy="46%" r="48%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="500" fill="url(#artLanternSky)" />
        <rect width="400" height="500" fill="url(#artLanternGlow)" />
        {[
          { x: 110, y: 170, s: 0.72 },
          { x: 292, y: 135, s: 0.65 },
          { x: 200, y: 230, s: 1.08 },
          { x: 135, y: 345, s: 0.52 },
          { x: 275, y: 330, s: 0.58 }
        ].map((l, idx) => (
          <g key={idx} transform={`translate(${l.x}, ${l.y}) scale(${l.s})`}>
            <path
              d="M-26 -38 Q0 -52 26 -38 L20 26 Q0 34 -20 26 Z"
              fill="#FDE047"
              stroke="#B45309"
              strokeWidth="2"
            />
            <circle cx="0" cy="14" r="7" fill="#EA580C" />
          </g>
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full object-cover"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="artCinemaSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFDF5" />
          <stop offset="55%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#artCinemaSky)" />
      <circle cx="630" cy="120" r="145" fill="#FFFFFF" opacity="0.55" />
      <path d="M0 340 Q260 295 530 345 T800 320 L800 450 L0 450 Z" fill="#65A30D" opacity="0.7" />
      <path d="M0 375 Q360 345 800 385 L800 450 L0 450 Z" fill="#3F6212" />
    </svg>
  );
};
