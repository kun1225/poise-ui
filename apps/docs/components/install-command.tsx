import { CopyButton } from "@/components/copy-button";

export function InstallCommand({ component }: { component: string }) {
  const command = `npx poise-ui add ${component}`;

  return (
    <div className="my-6 flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <code className="text-sm">{command}</code>
      <CopyButton value={command} />
    </div>
  );
}
