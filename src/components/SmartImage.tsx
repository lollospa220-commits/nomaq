import React from 'react';
import Image from 'next/image';

/**
 * next/image wrapper for the feed's remote (Unsplash) art.
 *
 * - `fill` + `sizes`: the Vercel image optimizer serves right-sized AVIF/WebP
 *   instead of the raw 800px Unsplash JPEG (cards render at ~170–300px), cutting
 *   image bytes several-fold — the dominant payload on every feed screen.
 * - onError → fallbackSrc: preserves the previous <img> behaviour of swapping to
 *   a deterministic destination image when the primary URL 404s (Unsplash
 *   occasionally removes photos).
 *
 * The parent must be `position: relative` and sized (all feed image containers
 * already are).
 */
export default function SmartImage({
  src,
  fallbackSrc,
  alt,
  sizes,
  className = '',
  priority = false,
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [current, setCurrent] = React.useState(src);

  // If the parent swaps the src prop (e.g. a new search result), follow it.
  React.useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      onError={() => {
        if (fallbackSrc && current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
    />
  );
}
