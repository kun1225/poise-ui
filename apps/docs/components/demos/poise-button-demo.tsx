"use client";

import { PoiseButton } from "@/components/poise-button";

export function PoiseButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PoiseButton variant="solid">Continue</PoiseButton>
      <PoiseButton variant="soft">Continue</PoiseButton>
      <PoiseButton variant="outline">Continue</PoiseButton>
      <PoiseButton variant="ghost">Continue</PoiseButton>
      <PoiseButton variant="danger">Delete</PoiseButton>
    </div>
  );
}
