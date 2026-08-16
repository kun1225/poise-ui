import {
  MorphAccordion,
  MorphAccordionItem,
  MorphAccordionPanel,
  MorphAccordionTrigger,
} from "@poise-ui/react/morph-accordion";

export function MorphAccordionPlainDemo() {
  return (
    <MorphAccordion className="my-6 max-w-85" hasBorder={false} scale>
      <MorphAccordionItem value="dividers">
        <MorphAccordionTrigger>
          Where did the dividers go?
        </MorphAccordionTrigger>
        <MorphAccordionPanel>
          `hasBorder` is off, so the closed rows read as one blank card until
          something splits it.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem value="scale">
        <MorphAccordionTrigger>What is scale doing?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          The rows that stayed closed shrink slightly, so the open card sits in
          front of them rather than among them.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem value="edges">
        <MorphAccordionTrigger>What still gets a border?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          Every edge where a card has to seal - the ends of the stack, and both
          sides of the gap.
        </MorphAccordionPanel>
      </MorphAccordionItem>
    </MorphAccordion>
  );
}
