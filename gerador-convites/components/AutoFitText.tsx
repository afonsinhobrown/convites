"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  maxFontSize?: number;
  minFontSize?: number;
  maxLines?: number;
  className?: string;
}

export function AutoFitText({
  text,
  maxFontSize = 48,
  minFontSize = 20,
  maxLines = 2,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const adjust = () => {
      let size = maxFontSize;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      while (size > minFontSize) {
        container.style.fontSize = `${size}px`;
        const lines = Math.ceil(container.scrollHeight / (size * 1.2));
        const fitsWidth = container.scrollWidth <= containerWidth;
        const fitsHeight = container.scrollHeight <= containerHeight;
        const fitsLines = lines <= maxLines;

        if (fitsWidth && fitsHeight && fitsLines) break;
        size -= 2;
      }

      setFontSize(size);
    };

    adjust();
    window.addEventListener("resize", adjust);
    return () => window.removeEventListener("resize", adjust);
  }, [text, maxFontSize, minFontSize, maxLines]);

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-200 ${className}`}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.2 }}
    >
      {text}
    </div>
  );
}
