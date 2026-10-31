// SVG planet + CSS starfield used in Lite mode or when WebGL is unavailable
export default function HeroFallback() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 60% 50%, #0d2040 0%, #050a14 70%)',
      }}
      aria-hidden="true"
    >
      {/* CSS stars */}
      <div className="absolute inset-0" style={{ opacity: 0.6 }}>
        {Array.from({ length: 80 }).map((_, i) => {
          const size = Math.random() * 2 + 1
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: size,
                height: size,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.2,
              }}
            />
          )
        })}
      </div>

      {/* SVG planet */}
      <svg
        viewBox="0 0 200 200"
        width="320"
        height="320"
        className="absolute"
        style={{ right: '8%', top: '50%', transform: 'translateY(-50%)' }}
      >
        {/* Glow */}
        <defs>
          <radialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="planetFill" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#1a5080" />
            <stop offset="60%" stopColor="#0a1e3d" />
            <stop offset="100%" stopColor="#050a14" />
          </radialGradient>
          <clipPath id="planetClip">
            <circle cx="100" cy="100" r="72" />
          </clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill="url(#planetGlow)" />
        <circle cx="100" cy="100" r="72" fill="url(#planetFill)" />
        {/* land patches */}
        <g clipPath="url(#planetClip)" opacity="0.7">
          <ellipse cx="80" cy="90" rx="22" ry="14" fill="#16503c" />
          <ellipse cx="115" cy="110" rx="16" ry="10" fill="#16503c" />
          <ellipse cx="90" cy="125" rx="12" ry="8" fill="#1a6048" />
        </g>
        {/* orbit ring ellipse */}
        <ellipse
          cx="100" cy="100" rx="95" ry="28"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="0.8"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}
