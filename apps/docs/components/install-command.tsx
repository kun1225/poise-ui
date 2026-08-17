import { CopyButton } from "@/components/copy-button";

export function InstallCommand({ command }: { command: string }) {
  return (
    <div className="border-border my-6 flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <code className="overflow-x-auto text-sm">{command}</code>
      <CopyButton value={command} />
    </div>
  );
}
