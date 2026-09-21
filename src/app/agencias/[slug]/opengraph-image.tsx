import { agencyService } from "@/lib/container";
import { DEFAULT_TITLE, SHARE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { OG_SIZE, renderShareCard } from "@/lib/og-card";

export const alt = `Ficha de inmobiliaria · ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function AgencyOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agency = await agencyService.getBySlug(slug, { publicOnly: true });
  if (!agency) {
    return renderShareCard({
      title: DEFAULT_TITLE,
      subtitle: SHARE_DESCRIPTION,
    });
  }
  return renderShareCard({
    title: `${agency.name} en ${agency.city}`,
    subtitle: SHARE_DESCRIPTION,
  });
}
