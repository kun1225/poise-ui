"use client";

import { Button } from "@poise-ui/react/button";

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="solid">Continue</Button>
      <Button variant="soft">Continue</Button>
      <Button variant="outline">Continue</Button>
      <Button variant="ghost">Continue</Button>
      <Button variant="danger">Delete</Button>
    </div>
  );
}
