import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SLATE = "#1e293b";
const STONE = "#fafaf9";
const MUTED = "#52525b";
const SCALE = 7.5;

function u(n) {
  return Math.round(n * SCALE * 100) / 100;
}

const plaque = { w: u(18.2), h: u(28) };

function box(style, children = "") {
  return h("div", { style: { display: "flex", ...style } }, children);
}

const markSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="6.9 2 18.2 28" width="${plaque.w}" height="${plaque.h}">
  <rect x="6.9" y="2" width="18.2" height="28" rx="0.9" fill="${SLATE}"/>
  <rect x="10.55" y="7.2" width="3.45" height="17.55" rx="0.2" fill="${STONE}"/>
  <rect x="15.35" y="7.2" width="6.35" height="3.75" rx="0.2" fill="${STONE}"/>
  <rect x="15.35" y="13.95" width="6.35" height="3.75" rx="0.2" fill="${STONE}"/>
</svg>`;
const markSrc = `data:image/svg+xml;base64,${Buffer.from(markSvg).toString("base64")}`;

const response = new ImageResponse(
  box(
    {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      background: STONE,
    },
    box(
      {
        flexDirection: "column",
        alignItems: "center",
      },
      [
        h("img", {
          src: markSrc,
          width: plaque.w,
          height: plaque.h,
          style: { marginBottom: 32 },
        }),
        box(
          {
            fontSize: 76,
            fontWeight: 600,
            color: SLATE,
            letterSpacing: -1.5,
            lineHeight: 1,
          },
          "Fachada",
        ),
        box(
          {
            marginTop: 16,
            fontSize: 30,
            fontWeight: 400,
            color: MUTED,
            lineHeight: 1,
          },
          "Antes de firmar.",
        ),
      ],
    ),
  ),
  { width: 1200, height: 630 },
);

const png = Buffer.from(await response.arrayBuffer());
const app = join(ROOT, "src", "app");
writeFileSync(join(app, "opengraph-image.png"), png);
writeFileSync(join(app, "twitter-image.png"), png);
writeFileSync(join(app, "opengraph-image.alt.txt"), "Fachada · Antes de firmar.\n");
writeFileSync(join(app, "twitter-image.alt.txt"), "Fachada · Antes de firmar.\n");
console.log(`wrote ${png.length} bytes`);
