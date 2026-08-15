import { LitElement, css, html } from "lit";
import { animate } from "motion";

import { springs } from "@poise-ui/motion";

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export class PoiseButton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    type: { type: String },
  };

  declare variant: ButtonVariant;
  declare size: ButtonSize;
  declare disabled: boolean;
  declare type: "button" | "submit" | "reset";

  constructor() {
    super();
    this.variant = "solid";
    this.size = "md";
    this.disabled = false;
    this.type = "button";
  }

  static styles = css`
    :host {
      display: inline-flex;
      --_bg: var(--poise-color-accent);
      --_fg: var(--poise-color-accent-fg);
      --_border: transparent;
      --_height: 2.25rem;
      --_padding: 1rem;
      --_font-size: 0.875rem;
    }

    :host([variant="soft"]) {
      --_bg: var(--poise-color-muted);
      --_fg: var(--poise-color-fg);
    }
    :host([variant="outline"]) {
      --_bg: transparent;
      --_fg: var(--poise-color-fg);
      --_border: var(--poise-color-border);
    }
    :host([variant="ghost"]) {
      --_bg: transparent;
      --_fg: var(--poise-color-fg);
    }
    :host([variant="danger"]) {
      --_bg: var(--poise-color-danger);
      --_fg: var(--poise-color-danger-fg);
    }

    :host([size="sm"]) {
      --_height: 2rem;
      --_padding: 0.75rem;
      --_font-size: 0.875rem;
    }
    :host([size="lg"]) {
      --_height: 2.75rem;
      --_padding: 1.5rem;
      --_font-size: 1rem;
    }

    button {
      display: inline-flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      height: var(--_height);
      padding-inline: var(--_padding);
      border: 1px solid var(--_border);
      border-radius: var(--poise-radius-md);
      background: var(--_bg);
      color: var(--_fg);
      font: inherit;
      font-size: var(--_font-size);
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      transition: background-color var(--poise-duration-fast) var(--poise-ease-standard),
        border-color var(--poise-duration-fast) var(--poise-ease-standard);
    }

    button:hover:not(:disabled) {
      background: color-mix(in oklch, var(--_bg) 90%, var(--poise-color-fg));
    }

    :host([variant="ghost"]) button:hover:not(:disabled),
    :host([variant="outline"]) button:hover:not(:disabled) {
      background: var(--poise-color-muted);
    }

    button:focus-visible {
      outline: 2px solid var(--poise-color-ring);
      outline-offset: 2px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
  `;

  /** Mirrors the React implementation's whileTap={{ scale: 0.96 }}. */
  #press = (scale: number) => {
    if (this.disabled) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animate(this, { scale }, springs.snappy);
  };

  render() {
    return html`
      <button
        type=${this.type}
        ?disabled=${this.disabled}
        @pointerdown=${() => this.#press(0.96)}
        @pointerup=${() => this.#press(1)}
        @pointerleave=${() => this.#press(1)}
      >
        <slot></slot>
      </button>
    `;
  }
}

customElements.define("poise-button", PoiseButton);

declare global {
  interface HTMLElementTagNameMap {
    "poise-button": PoiseButton;
  }
}
