import { RentUpdateTool } from "@/components/tools/rent-update-tool";
import { ToolLayout } from "@/components/tools/tool-layout";
import { toolById } from "@/lib/domain/tools/catalog";
import { pageMeta } from "@/lib/seo";

const tool = toolById("subida-alquiler");

export const metadata = pageMeta(tool.title, tool.description, tool.path);

export default function SubidaAlquilerPage() {
  return (
    <ToolLayout tool={tool}>
      <RentUpdateTool />
    </ToolLayout>
  );
}
