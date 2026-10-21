import { HandoverTool } from "@/components/tools/handover-tool";
import { ToolLayout } from "@/components/tools/tool-layout";
import { toolById } from "@/lib/domain/tools/catalog";
import { pageMeta } from "@/lib/seo";

const tool = toolById("acta-entrega-llaves");

export const metadata = pageMeta(tool.title, tool.description, tool.path);

export default function ActaEntregaLlavesPage() {
  return (
    <ToolLayout tool={tool}>
      <HandoverTool />
    </ToolLayout>
  );
}
