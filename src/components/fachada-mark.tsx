import { useId } from "react";

import { BRAND_SLATE, BRAND_STONE, FACHADA_MARK } from "@/lib/brand-mark";

export function FachadaMark({
  className,
  framed = false,
}: {
  className?: string;
  framed?: boolean;
}) {
  const cutId = useId();
  const { plaque, stem, window: hole } = FACHADA_MARK;
  const viewBox = framed
    ? `0 0 ${FACHADA_MARK.canvas} ${FACHADA_MARK.canvas}`
    : `${plaque.x} ${plaque.y} ${plaque.w} ${plaque.h}`;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      aria-hidden
    >
      {framed ? (
        <rect
          width={FACHADA_MARK.canvas}
          height={FACHADA_MARK.canvas}
          fill={BRAND_STONE}
        />
      ) : null}
      <defs>
        <mask id={cutId}>
          <rect
            x={plaque.x}
            y={plaque.y}
            width={plaque.w}
            height={plaque.h}
            rx={plaque.r}
            fill="#fff"
          />
          <rect
            x={stem.x}
            y={stem.y}
            width={stem.w}
            height={stem.h}
            rx={stem.r}
            fill="#000"
          />
          <rect
            x={hole.x}
            y={hole.top}
            width={hole.w}
            height={hole.h}
            rx={hole.r}
            fill="#000"
          />
          <rect
            x={hole.x}
            y={hole.bottom}
            width={hole.w}
            height={hole.h}
            rx={hole.r}
            fill="#000"
          />
        </mask>
      </defs>
      <rect
        x={plaque.x}
        y={plaque.y}
        width={plaque.w}
        height={plaque.h}
        rx={plaque.r}
        fill={BRAND_SLATE}
        mask={`url(#${cutId})`}
      />
    </svg>
  );
}
