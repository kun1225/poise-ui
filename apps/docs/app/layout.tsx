import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "poise-ui",
    template: "%s — poise-ui",
  },
  description:
    "A source-distributed component library for React and Web Components.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
            <Link href="/docs" className="font-semibold tracking-tight">
              poise-ui
            </Link>
            <Link
              href="/docs/components/accordion"
              className="text-sm text-muted-fg transition-colors hover:text-fg"
            >
              Components
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
