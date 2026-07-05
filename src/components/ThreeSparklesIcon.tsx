/* Sparkles send button (3 stars) — shared Nomaq brand icon. */
export default function ThreeSparklesIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      {/* big 4-point star */}
      <path d="M12 2 C12.5 6.5 14.5 8.5 19 9 C14.5 9.5 12.5 11.5 12 16 C11.5 11.5 9.5 9.5 5 9 C9.5 8.5 11.5 6.5 12 2 Z" />
      {/* small star bottom-right */}
      <path d="M18.5 13.5 C18.75 15.55 19.7 16.5 21.75 16.75 C19.7 17 18.75 17.95 18.5 20 C18.25 17.95 17.3 17 15.25 16.75 C17.3 16.5 18.25 15.55 18.5 13.5 Z" />
      {/* small star bottom-left */}
      <path d="M7 15.5 C7.2 17.15 7.95 17.9 9.6 18.1 C7.95 18.3 7.2 19.05 7 20.7 C6.8 19.05 6.05 18.3 4.4 18.1 C6.05 17.9 6.8 17.15 7 15.5 Z" />
    </svg>
  );
}
