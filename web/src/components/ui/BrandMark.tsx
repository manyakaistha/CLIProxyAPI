interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${className}`} role="img" aria-label="CLI Proxy API">
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="m7 8 8 8-8 8M17 8l8 8-8 8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
