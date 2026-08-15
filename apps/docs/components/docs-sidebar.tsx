"use client";

import type { Node, Root } from "fumadocs-core/page-tree";
import Link from "next/link";
import { usePathname } from "next/navigation";

function TreeNode({ node }: { node: Node }) {
  const pathname = usePathname();

  if (node.type === "separator") {
    return (
      <li className="mt-6 mb-2 px-2 text-xs font-medium tracking-wide text-muted-fg uppercase">
        {node.name}
      </li>
    );
  }

  if (node.type === "folder") {
    return (
      <li className="mt-6 first:mt-0">
        <span className="block px-2 pb-2 text-xs font-medium tracking-wide text-muted-fg uppercase">
          {node.name}
        </span>
        <ul>
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} />
          ))}
        </ul>
      </li>
    );
  }

  const active = pathname === node.url;

  return (
    <li>
      <Link
        href={node.url}
        aria-current={active ? "page" : undefined}
        className={`block rounded-sm px-2 py-1.5 text-sm transition-colors ${
          active ? "bg-muted font-medium text-fg" : "text-muted-fg hover:text-fg"
        }`}
      >
        {node.name}
      </Link>
    </li>
  );
}

export function DocsSidebar({ tree }: { tree: Root }) {
  return (
    <nav aria-label="Documentation" className="text-sm">
      <ul>
        {tree.children.map((node, index) => (
          <TreeNode key={index} node={node} />
        ))}
      </ul>
    </nav>
  );
}
