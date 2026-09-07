"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * One-shot reveal for marketing/directory sections.
 * Skips animation when reduced-motion is preferred.
 */
export function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        visible
          ? {
              animation: `fade-rise var(--duration-enter) var(--ease-out) both`,
              animationDelay: delayMs ? `${delayMs}ms` : undefined,
            }
          : { opacity: 0 }
      }
    >
      {children}
    </div>
  );
}
