import { cn } from "@poise-ui/shared";

const ITEM_CHANGE_EVENT = "poise-accordion-item-change";
const PANEL_HEIGHT = "--accordion-panel-height";

let nextId = 0;

function createId(part: "trigger" | "panel") {
  nextId += 1;
  return `poise-accordion-${part}-${nextId}`;
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForAnimations(element: HTMLElement) {
  await nextFrame();
  await Promise.allSettled(
    element.getAnimations().map((animation) => animation.finished),
  );
}

function defineElement(name: string, constructor: CustomElementConstructor) {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}

export type AccordionValueChangeDetail = {
  value: string[];
};

export class AccordionContent extends HTMLElement {
  #open: boolean | undefined;
  #transition = 0;

  connectedCallback() {
    this.dataset.slot = "accordion-panel";
    this.setAttribute("role", "region");
    this.className = cn(
      "text-muted-fg h-(--accordion-panel-height) overflow-hidden text-sm",
      "data-ending-style:block data-open:block data-starting-style:block",
      "data-ending-style:h-0 data-ending-style:translate-y-2 data-ending-style:opacity-0",
      "data-starting-style:h-0 data-starting-style:translate-y-2",
      "duration-base ease-standard transition-[height,opacity,translate]",
      "motion-reduce:transition-none",
      this.className,
    );

    queueMicrotask(() => this.item?.sync());
  }

  get item() {
    const item = this.parentElement;
    return item instanceof AccordionItem ? item : null;
  }

  setOpen(open: boolean) {
    if (this.#open === open) {
      return;
    }

    const initial = this.#open === undefined;
    this.#open = open;
    this.#transition += 1;

    if (initial) {
      this.#setAccessibility(open);
      this.#setStateAttributes(open);
      this.hidden = !open;
      return;
    }

    if (open) {
      void this.#openPanel(this.#transition);
    } else {
      void this.#closePanel(this.#transition);
    }
  }

  async #openPanel(transition: number) {
    const wasHidden = this.hidden;

    this.hidden = false;
    this.#setAccessibility(true);

    if (wasHidden) {
      this.dataset.startingStyle = "";
    }

    this.style.setProperty(PANEL_HEIGHT, `${this.scrollHeight}px`);
    this.#setStateAttributes(true);
    this.removeAttribute("data-ending-style");
    await nextFrame();

    if (transition !== this.#transition) {
      return;
    }

    this.removeAttribute("data-starting-style");
    await waitForAnimations(this);

    if (transition === this.#transition) {
      this.style.removeProperty(PANEL_HEIGHT);
    }
  }

  async #closePanel(transition: number) {
    if (this.hidden) {
      this.#setAccessibility(false);
      this.#setStateAttributes(false);
      return;
    }

    const currentHeight = this.getBoundingClientRect().height;

    this.style.setProperty(PANEL_HEIGHT, `${currentHeight}px`);
    this.removeAttribute("data-starting-style");
    this.#setAccessibility(false);

    // Commit the measured height before applying the ending styles.
    this.getBoundingClientRect();
    this.#setStateAttributes(false);
    this.dataset.endingStyle = "";

    await waitForAnimations(this);

    if (transition !== this.#transition) {
      return;
    }

    this.hidden = true;
    this.removeAttribute("data-ending-style");
    this.style.removeProperty(PANEL_HEIGHT);
  }

  #setAccessibility(open: boolean) {
    this.inert = !open;
    this.setAttribute("aria-hidden", String(!open));
  }

  #setStateAttributes(open: boolean) {
    this.toggleAttribute("data-open", open);
    this.toggleAttribute("data-closed", !open);
  }
}

export class AccordionTrigger extends HTMLElement {
  #disabled = false;

  connectedCallback() {
    this.dataset.slot = "accordion-trigger";
    this.setAttribute("role", "button");
    this.tabIndex = 0;
    this.className = cn(
      "group text-fg flex w-full cursor-pointer items-center justify-between gap-4 rounded-sm px-4 py-3 text-left text-sm font-medium",
      "hover:not-data-disabled:bg-muted",
      "focus-visible:outline-ring outline-2 -outline-offset-1 outline-transparent focus-visible:relative focus-visible:z-1 focus-visible:outline-offset-2",
      "data-disabled:text-muted-fg data-disabled:cursor-not-allowed",
      "duration-fast ease-standard transition-[background,outline,outline-offset]",
      this.className,
    );
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keydown", this.#handleKeyDown);

    queueMicrotask(() => this.item?.sync());
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keydown", this.#handleKeyDown);
  }

  get item() {
    const item = this.parentElement;
    return item instanceof AccordionItem ? item : null;
  }

  sync(open: boolean, disabled: boolean, panelId: string) {
    this.#disabled = disabled;
    this.setAttribute("aria-controls", panelId);
    this.setAttribute("aria-expanded", String(open));
    this.setAttribute("aria-disabled", String(disabled));
    this.toggleAttribute("data-panel-open", open);
    this.toggleAttribute("data-disabled", disabled);
  }

  readonly #handleClick = () => {
    if (!this.#disabled) {
      this.item?.toggle();
    }
  };

  readonly #handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();

    if (!this.#disabled) {
      this.item?.toggle();
    }
  };
}

export class AccordionItem extends HTMLElement {
  static observedAttributes = ["disabled", "open", "value"];

  readonly #fallbackValue = createId("panel");
  readonly #observer = new MutationObserver(() => this.sync());

  connectedCallback() {
    this.dataset.slot = "accordion-item";
    this.className = cn("block", this.className);
    this.#observer.observe(this, { childList: true });
    queueMicrotask(() => this.sync());
  }

  disconnectedCallback() {
    this.#observer.disconnect();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) {
      return;
    }

    this.sync();

    if (this.isConnected && (name === "open" || name === "value")) {
      this.dispatchEvent(
        new CustomEvent(ITEM_CHANGE_EVENT, {
          bubbles: true,
        }),
      );
    }
  }

  get value() {
    return this.getAttribute("value") ?? this.#fallbackValue;
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(open: boolean) {
    this.toggleAttribute("open", open);
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(disabled: boolean) {
    this.toggleAttribute("disabled", disabled);
  }

  get trigger() {
    return this.querySelector<AccordionTrigger>(
      ":scope > poise-accordion-trigger",
    );
  }

  get content() {
    return this.querySelector<AccordionContent>(
      ":scope > poise-accordion-content",
    );
  }

  toggle() {
    if (!this.#isDisabled()) {
      this.open = !this.open;
    }
  }

  sync() {
    const trigger = this.trigger;
    const content = this.content;

    this.toggleAttribute("data-open", this.open);
    this.toggleAttribute("data-closed", !this.open);
    this.toggleAttribute("data-disabled", this.#isDisabled());

    if (!trigger || !content) {
      return;
    }

    trigger.id ||= createId("trigger");
    content.id ||= createId("panel");
    content.setAttribute("aria-labelledby", trigger.id);
    trigger.sync(this.open, this.#isDisabled(), content.id);
    content.setOpen(this.open);
  }

  #isDisabled() {
    const root = this.parentElement;
    return this.disabled || (root instanceof Accordion && root.disabled);
  }
}

export class Accordion extends HTMLElement {
  static observedAttributes = ["disabled", "multiple"];

  readonly #observer = new MutationObserver(() => this.#syncItems(false));
  #updating = false;
  #changeQueued = false;
  #lastValue = "[]";

  connectedCallback() {
    this.dataset.slot = "accordion";
    this.className = cn("divide-border block w-full divide-y", this.className);
    this.addEventListener(ITEM_CHANGE_EVENT, this.#handleItemChange);
    this.#observer.observe(this, { childList: true });
    this.#syncItems(false);
    this.#lastValue = JSON.stringify(this.value);
  }

  disconnectedCallback() {
    this.removeEventListener(ITEM_CHANGE_EVENT, this.#handleItemChange);
    this.#observer.disconnect();
  }

  attributeChangedCallback(
    _name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue !== newValue && this.isConnected) {
      this.#syncItems(true);
    }
  }

  get value(): string[] {
    return this.#items()
      .filter((item) => item.open)
      .map((item) => item.value);
  }

  set value(values: string[]) {
    const selected = new Set(this.multiple ? values : values.slice(0, 1));

    this.#updating = true;
    for (const item of this.#items()) {
      item.open = selected.has(item.value);
    }
    this.#updating = false;
    this.#queueValueChange();
  }

  get multiple() {
    return this.hasAttribute("multiple");
  }

  set multiple(multiple: boolean) {
    this.toggleAttribute("multiple", multiple);
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(disabled: boolean) {
    this.toggleAttribute("disabled", disabled);
  }

  #items() {
    return Array.from(this.children).filter(
      (element): element is AccordionItem => element instanceof AccordionItem,
    );
  }

  #syncItems(emitChange: boolean) {
    const items = this.#items();

    this.#updating = true;
    this.toggleAttribute("data-disabled", this.disabled);

    let foundOpenItem = false;
    for (const item of items) {
      if (!this.multiple && item.open) {
        if (foundOpenItem) {
          item.open = false;
        } else {
          foundOpenItem = true;
        }
      }

      item.sync();
    }

    this.#updating = false;

    if (emitChange) {
      this.#queueValueChange();
    }
  }

  readonly #handleItemChange = (event: Event) => {
    if (this.#updating || !(event.target instanceof AccordionItem)) {
      return;
    }

    const changedItem = event.target;
    if (changedItem.parentElement !== this) {
      return;
    }

    if (changedItem.open && !this.multiple) {
      this.#updating = true;
      for (const item of this.#items()) {
        if (item !== changedItem) {
          item.open = false;
        }
      }
      this.#updating = false;
    }

    this.#queueValueChange();
  };

  #queueValueChange() {
    if (this.#changeQueued) {
      return;
    }

    this.#changeQueued = true;
    queueMicrotask(() => {
      this.#changeQueued = false;
      const value = this.value;
      const serializedValue = JSON.stringify(value);

      if (serializedValue === this.#lastValue) {
        return;
      }

      this.#lastValue = serializedValue;
      this.dispatchEvent(
        new CustomEvent<AccordionValueChangeDetail>("value-change", {
          bubbles: true,
          detail: { value },
        }),
      );
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "poise-accordion": Accordion;
    "poise-accordion-content": AccordionContent;
    "poise-accordion-item": AccordionItem;
    "poise-accordion-trigger": AccordionTrigger;
  }
}

defineElement("poise-accordion-content", AccordionContent);
defineElement("poise-accordion-trigger", AccordionTrigger);
defineElement("poise-accordion-item", AccordionItem);
defineElement("poise-accordion", Accordion);
