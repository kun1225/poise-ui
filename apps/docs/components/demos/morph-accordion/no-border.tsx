import {
  MorphAccordion,
  MorphAccordionItem,
  MorphAccordionPanel,
  MorphAccordionTrigger,
} from "@poise-ui/react/morph-accordion";

export function MorphAccordionNoBorderDemo() {
  return (
    <MorphAccordion className="my-6 max-w-85" hasBorder={false}>
      <MorphAccordionItem>
        <MorphAccordionTrigger>
          Where did the dividers go?
        </MorphAccordionTrigger>
        <MorphAccordionPanel>
          `hasBorder` is off, so the closed rows read as one blank card until
          something splits it.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem>
        <MorphAccordionTrigger>What still gets a border?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          Every edge where a card has to seal - the ends of the stack, and both
          sides of the gap.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem>
        <MorphAccordionTrigger>Can I set it in CSS?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          It resolves to `--morph-divider`, so a class can paint the dividers
          any colour you like.
        </MorphAccordionPanel>
      </MorphAccordionItem>
    </MorphAccordion>
  );
}
