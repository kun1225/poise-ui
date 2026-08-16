"use client";

import { Accordion as Primitive } from "@base-ui/react/accordion";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { springs } from "@poise-ui/motion";
import { cn } from "@poise-ui/shared";
import { motion, type HTMLMotionProps } from "motion/react";
import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";

const CLOSED_SCALE = 0.96;
/** Panel content trails the split slightly, so the card reads as filling in. */
const REVEAL_DELAY = 0.06;

type MorphRootContextValue = {
  gap: number;
  closedScale: number;
  openIndexes: readonly number[];
  reportOpen: (index: number, open: boolean) => void;
};

const MorphRootContext = createContext<MorphRootContextValue | null>(null);

function useMorphRoot(part: string) {
  const context = use(MorphRootContext);
  if (!context) {
    throw new Error(`<${part}> must be rendered inside <MorphAccordion>.`);
  }
  return context;
}

const MorphItemContext = createContext<{ open: boolean } | null>(null);

function useMorphItem(part: string) {
  const context = use(MorphItemContext);
  if (!context) {
    throw new Error(`<${part}> must be rendered inside <MorphAccordionItem>.`);
  }
  return context;
}

export type MorphAccordionProps = Omit<Primitive.Root.Props, "render"> & {
  /** Divide rows that are both closed. Off leaves the stack as one blank card. */
  hasBorder?: boolean;
  /** Shrink the rows that stayed closed while another row is open. */
  scale?: boolean;
  /** Pixels a neighbouring row moves clear of the open one. */
  gap?: number;
};

/**
 * The root owns the one thing an item cannot see for itself: which of its
 * siblings is open. Items report their own state here on layout, so the
 * neighbours know which way to move within the same frame as the panel opens.
 *
 * `hasBorder` still resolves to a custom property rather than being handed
 * down, because borders are the part that stayed in CSS.
 *
 * The divider reads `--poise-color-border` rather than `--color-border`: the
 * token file maps the Tailwind theme with `@theme inline`, so the theme names
 * only exist at build time and resolve to nothing at runtime.
 */
function MorphAccordion({
  className,
  hasBorder = true,
  scale = false,
  gap = 16,
  ...props
}: MorphAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<readonly number[]>([]);

  const reportOpen = useCallback((index: number, open: boolean) => {
    setOpenIndexes((current) => {
      if (current.includes(index) === open) {
        return current;
      }
      return open
        ? [...current, index].sort((a, b) => a - b)
        : current.filter((openIndex) => openIndex !== index);
    });
  }, []);

  const context = useMemo(
    () => ({
      gap,
      closedScale: scale ? CLOSED_SCALE : 1,
      openIndexes,
      reportOpen,
    }),
    [gap, scale, openIndexes, reportOpen],
  );

  return (
    <MorphRootContext value={context}>
      <Primitive.Root
        data-slot="morph-accordion"
        className={cn(
          "isolate w-full",
          hasBorder
            ? "[--morph-divider:var(--poise-color-border)]"
            : "[--morph-divider:transparent]",
          className,
        )}
        {...props}
      />
    </MorphRootContext>
  );
}

/**
 * Closed, the stack reads as a single card. Opening an item detaches it: it
 * rounds on all four corners and its neighbours slide clear by `gap`, leaving
 * the rows above and below sealed as cards of their own.
 *
 * Only borders and corners live here. Everything that moves is a spring on the
 * element itself - see `MorphItemSurface`.
 *
 * Every border is present at every moment and only its colour changes, so none
 * of this shifts layout by the width of a border. The top edge carries
 * `--morph-divider`, which is what `hasBorder` switches off; the edges that
 * seal a card override it and stay painted either way.
 */
const morphItem = cn(
  "bg-bg relative border border-transparent",
  "border-x-border border-t-(--morph-divider)",
  "last:border-b-border first:border-t-border first:rounded-t-2xl last:rounded-b-2xl",
  "[&:has(button:hover:not([data-disabled]))]:bg-muted",
  // The open card, and the two edges it seals against.
  "data-open:border-t-border data-open:border-b-border data-open:z-1 data-open:rounded-2xl",
  "[&:has(+[data-open])]:border-b-border [&:has(+[data-open])]:rounded-b-2xl",
  "[[data-open]+&]:border-t-border [[data-open]+&]:rounded-t-2xl",
  "duration-slowest ease-standard transition-[border-color,border-radius,background-color]",
);

export type MorphAccordionItemProps = Omit<Primitive.Item.Props, "render">;

function MorphAccordionItem({ className, ...props }: MorphAccordionItemProps) {
  return (
    <Primitive.Item
      data-slot="morph-accordion-item"
      className={cn(morphItem, className)}
      {...props}
      render={(renderProps, state) => (
        <MorphItemSurface
          {...renderProps}
          index={state.index}
          open={state.open}
        />
      )}
    />
  );
}

type MorphItemSurfaceProps = ComponentProps<"div"> & {
  index: number;
  open: boolean;
};

/**
 * A handful of DOM props - `onAnimationStart`, the drag handlers - mean
 * something else on a `motion` element, so their two signatures cannot be
 * reconciled. Base UI never passes them; assert past the overlap rather than
 * widening the parts' own props to Motion's.
 */
const asMotionProps = (props: ComponentProps<"div">) =>
  props as HTMLMotionProps<"div">;

/**
 * The gap is a transform rather than a margin, so the card you clicked stays
 * put under the pointer and only its neighbours move. The trade is that they
 * move outside the accordion's own box - leave room around it.
 */
function MorphItemSurface({
  index,
  open,
  children,
  ...props
}: MorphItemSurfaceProps) {
  const { gap, closedScale, openIndexes, reportOpen } =
    useMorphRoot("MorphAccordionItem");

  // Layout, not passive: the report has to land before paint, or a neighbour
  // would start moving a frame after the panel it is moving away from.
  useLayoutEffect(() => {
    reportOpen(index, open);
    return () => reportOpen(index, false);
  }, [index, open, reportOpen]);

  const push = open ? 0 : pushDirection(index, openIndexes);

  return (
    <motion.div
      {...asMotionProps(props)}
      initial={false}
      animate={{ y: push * gap, scale: push === 0 ? 1 : closedScale }}
      transition={springs.bouncy}
    >
      <MorphItemContext value={{ open }}>{children}</MorphItemContext>
    </motion.div>
  );
}

/**
 * Which way the nearest open row shoves this one: 1 down, -1 up, 0 not at all.
 * Nearest rather than first, so a row caught between two open rows moves away
 * from the one that actually crowds it.
 */
function pushDirection(index: number, openIndexes: readonly number[]) {
  let direction = 0;
  let shortest = Infinity;

  for (const openIndex of openIndexes) {
    const distance = Math.abs(openIndex - index);
    if (distance < shortest) {
      shortest = distance;
      direction = openIndex < index ? 1 : -1;
    }
  }

  return direction;
}

export type MorphAccordionTriggerProps = Omit<
  Primitive.Trigger.Props,
  "render"
> & {
  headerClassName?: string;
};

function MorphAccordionTrigger({
  className,
  headerClassName,
  children,
  ...props
}: MorphAccordionTriggerProps) {
  const { open } = useMorphItem("MorphAccordionTrigger");

  return (
    <Primitive.Header
      data-slot="morph-accordion-header"
      className={headerClassName}
    >
      <Primitive.Trigger
        data-slot="morph-accordion-trigger"
        className={cn(
          "group text-fg flex w-full cursor-pointer items-center gap-4 rounded-[inherit] px-4 py-3.5 text-left text-sm font-medium",
          "focus-visible:outline-ring outline-2 -outline-offset-1 outline-transparent focus-visible:relative focus-visible:z-1 focus-visible:outline-offset-2",
          "data-disabled:text-muted-fg data-disabled:cursor-not-allowed",
          "duration-fast ease-standard transition-[outline,outline-offset]",
          className,
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        <motion.span
          aria-hidden="true"
          className="flex shrink-0"
          initial={false}
          animate={{ rotate: open ? 225 : 0 }}
          transition={springs.bouncy}
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            size={16}
            className="text-muted-fg duration-fast ease-standard opacity-70 transition-opacity group-hover:opacity-100"
          />
        </motion.span>
      </Primitive.Trigger>
    </Primitive.Header>
  );
}

export type MorphAccordionPanelProps = Omit<
  Primitive.Panel.Props,
  "render" | "keepMounted"
>;

/**
 * Base UI decides when to unmount a panel by watching for a CSS transition on
 * it. There is none to find now, so it would tear the panel out before Motion
 * could animate it away. `keepMounted` hands that decision over: the element
 * stays, `hidden` is refused, and `inert` keeps a closed panel out of the
 * accessibility tree and off the tab order in its place.
 */
function MorphAccordionPanel({
  className,
  children,
  ...props
}: MorphAccordionPanelProps) {
  return (
    <Primitive.Panel
      keepMounted
      data-slot="morph-accordion-panel"
      className={cn("text-muted-fg overflow-hidden text-sm", className)}
      {...props}
      render={(renderProps, state) => (
        <motion.div
          {...asMotionProps(renderProps)}
          hidden={false}
          inert={!state.open}
          initial={false}
          animate={{ height: state.open ? "auto" : 0 }}
          transition={springs.bouncy}
        >
          {/*
           * The text rides the card rather than bouncing with it. `smooth`
           * never crosses its target, so a line of copy cannot land, back up
           * and land again while you are reading it.
           */}
          <motion.div
            className="px-4 pb-4"
            initial={false}
            animate={
              state.open
                ? { y: 0, opacity: 1, filter: "blur(0px)" }
                : { y: 16, opacity: 0.4, filter: "blur(4px)" }
            }
            transition={{
              ...springs.smooth,
              delay: state.open ? REVEAL_DELAY : 0,
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    />
  );
}

export {
  MorphAccordion,
  MorphAccordionItem,
  MorphAccordionTrigger,
  MorphAccordionPanel,
};
