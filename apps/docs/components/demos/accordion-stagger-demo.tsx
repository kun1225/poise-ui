import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@poise-ui/react/accordion";

export function AccordionStaggerDemo() {
  return (
    <Accordion className="max-w-80">
      <AccordionItem value="steps">
        <AccordionTrigger>What does the CLI do?</AccordionTrigger>
        <AccordionPanel reveal="stagger">
          <p>It reads the registry and resolves what the item depends on.</p>
          <p className="mt-2">
            It writes the design tokens and the <code>cn</code> helper once.
          </p>
          <p className="mt-2">Then it copies the component into your repo.</p>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="own">
        <AccordionTrigger>What do I own afterwards?</AccordionTrigger>
        <AccordionPanel reveal="stagger">
          <p>Every file it wrote, as ordinary source in your project.</p>
          <p className="mt-2">No package to upgrade, no styles to override.</p>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
