import { DEFAULT_TITLE, SHARE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { OG_SIZE, renderShareCard } from "@/lib/og-card";

export const alt = `${DEFAULT_TITLE} · ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderShareCard({
    title: DEFAULT_TITLE,
    subtitle: SHARE_DESCRIPTION,
  });
}
