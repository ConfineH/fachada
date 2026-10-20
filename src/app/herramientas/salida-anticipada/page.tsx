import { EarlyExitTool } from "@/components/tools/early-exit-tool";
import { ToolLayout } from "@/components/tools/tool-layout";
import { toolById } from "@/lib/domain/tools/catalog";
import { pageMeta } from "@/lib/seo";

const tool = toolById("salida-anticipada");

export const metadata = pageMeta(tool.title, tool.description, tool.path);

export default function SalidaAnticipadaPage() {
  return (
    <ToolLayout tool={tool}>
      <EarlyExitTool />
    </ToolLayout>
  );
}
