import { FeesTool } from "@/components/tools/fees-tool";
import { ToolLayout } from "@/components/tools/tool-layout";
import { toolById } from "@/lib/domain/tools/catalog";
import { pageMeta } from "@/lib/seo";

const tool = toolById("honorarios");

export const metadata = pageMeta(tool.title, tool.description, tool.path);

export default function HonorariosPage() {
  return (
    <ToolLayout tool={tool}>
      <FeesTool />
    </ToolLayout>
  );
}
