export default function Logo({ size = 36, rounded = 'rounded-xl' }) {
  return (
    <div className={`relative shrink-0 overflow-hidden ${rounded} shadow-sm`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size} height={size} className="block" role="img" aria-label="HabitTracker logo">
        <defs>
          <linearGradient id="logoBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="logoGloss" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" fill="url(#logoBg)" />
        <rect width="40" height="20" fill="url(#logoGloss)" />
        <circle cx="31" cy="9" r="7" fill="#ffffff" opacity="0.08" />
        <path d="M13 20.5l5 5 9-10.5" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}