"use client";

import { useState } from "react";

import { Button } from "@poise-ui/react/button";

import { PoiseButton } from "../components/poise-button";

const VARIANTS = ["solid", "soft", "outline", "ghost", "danger"] as const;
const SIZES = ["sm", "md", "lg"] as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr_1fr] items-center gap-4 border-b border-border py-4 last:border-b-0">
      <span className="text-sm text-muted-fg">{label}</span>
      {children}
    </div>
  );
}

export default function Page() {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark((previous) => {
      document.documentElement.classList.toggle("dark", !previous);
      return !previous;
    });
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">poise-ui</h1>
          <p className="mt-1 text-sm text-muted-fg">
            Same tokens, same springs, two implementations. Press and hold to
            compare the interaction.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          {dark ? "Light" : "Dark"}
        </Button>
      </header>

      <div className="grid grid-cols-[7rem_1fr_1fr] gap-4 pb-2 text-xs font-medium tracking-wide text-muted-fg uppercase">
        <span />
        <span>React</span>
        <span>Web Component</span>
      </div>

      <section>
        {VARIANTS.map((variant) => (
          <Row key={variant} label={variant}>
            <div>
              <Button variant={variant}>Continue</Button>
            </div>
            <div>
              <PoiseButton variant={variant}>Continue</PoiseButton>
            </div>
          </Row>
        ))}

        {SIZES.map((size) => (
          <Row key={size} label={`size ${size}`}>
            <div>
              <Button size={size}>Continue</Button>
            </div>
            <div>
              <PoiseButton size={size}>Continue</PoiseButton>
            </div>
          </Row>
        ))}

        <Row label="disabled">
          <div>
            <Button disabled>Continue</Button>
          </div>
          <div>
            <PoiseButton disabled>Continue</PoiseButton>
          </div>
        </Row>
      </section>
    </main>
  );
}
