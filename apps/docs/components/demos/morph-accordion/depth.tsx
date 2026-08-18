import {
  MorphAccordion,
  MorphAccordionItem,
  MorphAccordionPanel,
  MorphAccordionTrigger,
} from "@poise-ui/react/morph-accordion";

export function MorphAccordionDepthDemo() {
  return (
    <MorphAccordion className="my-6 max-w-85" depth>
      <MorphAccordionItem>
        <MorphAccordionTrigger>What is depth doing?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          The rows that stayed closed shrink, dim and blur slightly, so the open
          card sits in front of them rather than among them.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem>
        <MorphAccordionTrigger>Are they still clickable?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          Yes - a receded row takes a click and becomes the open one, so keep
          their labels short enough to read while blurred.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem>
        <MorphAccordionTrigger>When should I skip it?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          When the closed rows carry anything you need to read while another one
          is open.
        </MorphAccordionPanel>
      </MorphAccordionItem>
    </MorphAccordion>
  );
}
