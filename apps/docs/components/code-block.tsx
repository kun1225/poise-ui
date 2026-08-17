import { CopyButton } from "@/components/copy-button";

export type CodeBlockProps = {
  code: string;
  /** Shown in the header, e.g. the path the file is written to. */
  label?: string;
};

export function CodeBlock({ code, label }: CodeBlockProps) {
  return (
    <div className="border-border my-6 overflow-hidden rounded-lg border">
      <div className="border-border flex items-center justify-between gap-4 border-b px-3 py-2">
        <span className="text-muted-fg text-xs">{label}</span>
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
