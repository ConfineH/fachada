import { ImageResponse } from "next/og";

import { BRAND_SLATE, BRAND_STONE } from "@/lib/brand-mark";
import { SHARE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const OG_SIZE = { width: 1200, height: 630 };

export function renderShareCard({
  title,
  subtitle = SHARE_DESCRIPTION,
}: {
  title: string;
  subtitle?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: BRAND_STONE,
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 256,
            height: 256,
            marginRight: 56,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 55,
              top: 16,
              width: 146,
              height: 224,
              borderRadius: 7,
              background: BRAND_SLATE,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 84,
              top: 58,
              width: 28,
              height: 140,
              borderRadius: 2,
              background: BRAND_STONE,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 123,
              top: 58,
              width: 51,
              height: 30,
              borderRadius: 2,
              background: BRAND_STONE,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 123,
              top: 112,
              width: 51,
              height: 30,
              borderRadius: 2,
              background: BRAND_STONE,
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 740,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 8,
              color: "#52525b",
              marginBottom: 18,
            }}
          >
            {SITE_NAME.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 600,
              color: BRAND_SLATE,
              lineHeight: 1.15,
              marginBottom: 22,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#52525b",
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
