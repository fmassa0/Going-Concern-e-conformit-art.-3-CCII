// Marchio Ingenia: chevron ">" + underscore "_" con gradiente viola→teal.
export default function IngeniaMark({ className = 'ing-mark' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-label="Ingenia">
      <defs>
        <linearGradient id="ingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6b5bce" />
          <stop offset="0.5" stopColor="#4f7ec9" />
          <stop offset="1" stopColor="#34c08a" />
        </linearGradient>
      </defs>
      <path d="M20 14 L60 50 L20 86" stroke="url(#ingGrad)" strokeWidth="13"
            strokeLinecap="round" strokeLinejoin="round" />
      <rect x="50" y="74" width="34" height="12" rx="3" fill="url(#ingGrad)" />
    </svg>
  )
}
