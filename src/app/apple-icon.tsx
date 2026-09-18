import { ImageResponse } from "next/og";

import { BRAND_SLATE, BRAND_STONE } from "@/lib/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BRAND_STONE,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 39,
            top: 11,
            width: 102,
            height: 158,
            borderRadius: 5,
            background: BRAND_SLATE,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 59,
            top: 41,
            width: 19,
            height: 99,
            borderRadius: 1,
            background: BRAND_STONE,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 86,
            top: 41,
            width: 36,
            height: 21,
            borderRadius: 1,
            background: BRAND_STONE,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 86,
            top: 78,
            width: 36,
            height: 21,
            borderRadius: 1,
            background: BRAND_STONE,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
