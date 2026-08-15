import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * `disabled` is typed as the empty string rather than a boolean: Lit
       * reads it as an attribute, and React would serialise `false` to the
       * literal string "false", which is attribute-present and so truthy.
       */
      "poise-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        variant?: string;
        size?: string;
        disabled?: "";
      };
    }
  }
}
