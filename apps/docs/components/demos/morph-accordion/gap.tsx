import {
  MorphAccordion,
  MorphAccordionItem,
  MorphAccordionPanel,
  MorphAccordionTrigger,
} from "@poise-ui/react/morph-accordion";

export function MorphAccordionGapDemo() {
  return (
    <MorphAccordion className="my-10 max-w-85" gap={32}>
      <MorphAccordionItem>
        <MorphAccordionTrigger>How far do rows move?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          `gap` is 32 here, so every neighbour clears the open card by twice the
          default.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem>
        <MorphAccordionTrigger>Who moves, exactly?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          The rows above go up and the rows below go down - the card you clicked
          stays put under the pointer.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem>
        <MorphAccordionTrigger>What does it cost?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          The movement is a transform, so a larger gap reaches further outside
          the accordion's box. Leave that much room around it.
        </MorphAccordionPanel>
      </MorphAccordionItem>
    </MorphAccordion>
  );
}
