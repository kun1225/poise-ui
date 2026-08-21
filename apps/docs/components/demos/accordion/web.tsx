"use client";

import { useEffect, useState, type HTMLAttributes } from "react";

type CustomElementProps = HTMLAttributes<HTMLElement>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "poise-accordion": CustomElementProps & {
        disabled?: boolean;
        multiple?: boolean;
      };
      "poise-accordion-content": CustomElementProps;
      "poise-accordion-item": CustomElementProps & {
        disabled?: boolean;
        open?: boolean;
        value: string;
      };
      "poise-accordion-trigger": CustomElementProps;
    }
  }
}

export function AccordionWebDemo() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void import("@poise-ui/web/accordion").then(() => {
      if (active) {
        setReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return <div className="min-h-40 w-full max-w-80" />;
  }

  return (
    <div className="w-full max-w-80">
      <poise-accordion>
        <poise-accordion-item value="what" open>
          <poise-accordion-trigger>What is poise-ui?</poise-accordion-trigger>
          <poise-accordion-content>
            <div className="px-4 pt-0.5 pb-2">
              A registry of source files the CLI copies into your project, where
              you own and edit them.
            </div>
          </poise-accordion-content>
        </poise-accordion-item>

        <poise-accordion-item value="install">
          <poise-accordion-trigger>
            How do I install it?
          </poise-accordion-trigger>
          <poise-accordion-content>
            <div className="px-4 pt-0.5 pb-2">
              Run <code>npx poise-ui init</code>, then add the components you
              want.
            </div>
          </poise-accordion-content>
        </poise-accordion-item>

        <poise-accordion-item value="edit">
          <poise-accordion-trigger>
            Can I change the styles?
          </poise-accordion-trigger>
          <poise-accordion-content>
            <div className="px-4 pt-0.5 pb-2">
              The file lands in your repo, so edit it like any other component.
            </div>
          </poise-accordion-content>
        </poise-accordion-item>
      </poise-accordion>
    </div>
  );
}
