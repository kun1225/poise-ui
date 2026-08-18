import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@poise-ui/react/accordion";

export function AccordionDemo() {
  return (
    <Accordion className="max-w-80" defaultValue={["what"]}>
      <AccordionItem value="what">
        <AccordionTrigger>What is poise-ui?</AccordionTrigger>
        <AccordionPanel>
          A registry of source files the CLI copies into your project, where
          you own and edit them.
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="install">
        <AccordionTrigger>How do I install it?</AccordionTrigger>
        <AccordionPanel>
          Run <code>npx poise-ui init</code>, then add the components you want.
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="edit">
        <AccordionTrigger>Can I change the styles?</AccordionTrigger>
        <AccordionPanel>
          The file lands in your repo, so edit it like any other component.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
