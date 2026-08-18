import {
  MorphAccordion,
  MorphAccordionItem,
  MorphAccordionPanel,
  MorphAccordionTrigger,
} from "@poise-ui/react/morph-accordion";

export function MorphAccordionDemo() {
  return (
    <MorphAccordion className="my-6 max-w-85">
      <MorphAccordionItem value="engineering">
        <MorphAccordionTrigger>
          What is design engineering?
        </MorphAccordionTrigger>
        <MorphAccordionPanel>
          Where design intuition meets code execution - seeing UI problems and
          building the solution from the ground up.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem value="craft">
        <MorphAccordionTrigger>What is the craft of UI?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          Building things well: mastering the platform so you are not limited by
          your tools.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem value="platform">
        <MorphAccordionTrigger>
          Why focus on the web platform?
        </MorphAccordionTrigger>
        <MorphAccordionPanel>
          Working with the platform rather than against it buys performance,
          accessibility, and durability that last.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem value="why">
        <MorphAccordionTrigger>Why does craft matter?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          Because it is more than making something work - it is making something
          feel right.
        </MorphAccordionPanel>
      </MorphAccordionItem>

      <MorphAccordionItem value="who">
        <MorphAccordionTrigger>Who is this for?</MorphAccordionTrigger>
        <MorphAccordionPanel>
          Designers who code and developers who design - anyone ready to stop
          chasing snippets.
        </MorphAccordionPanel>
      </MorphAccordionItem>
    </MorphAccordion>
  );
}
