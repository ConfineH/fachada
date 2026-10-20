import { RepairsTool } from "@/components/tools/repairs-tool";
import { ToolLayout } from "@/components/tools/tool-layout";
import { toolById } from "@/lib/domain/tools/catalog";
import { pageMeta } from "@/lib/seo";

const tool = toolById("reparaciones");

export const metadata = pageMeta(tool.title, tool.description, tool.path);

export default function ReparacionesPage() {
  return (
    <ToolLayout tool={tool}>
      <RepairsTool />
    </ToolLayout>
  );
}
