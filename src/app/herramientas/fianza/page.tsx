import { DepositTool } from "@/components/tools/deposit-tool";
import { ToolLayout } from "@/components/tools/tool-layout";
import { toolById } from "@/lib/domain/tools/catalog";
import { pageMeta } from "@/lib/seo";

const tool = toolById("fianza");

export const metadata = pageMeta(tool.title, tool.description, tool.path);

export default function FianzaPage() {
  return (
    <ToolLayout tool={tool}>
      <DepositTool />
    </ToolLayout>
  );
}
