import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface HeroFaqAccordionProps {
  className?: string;
}

export function HeroFaqAccordion({ className }: HeroFaqAccordionProps) {
  return (
    <Accordion
      defaultValue={[]}
      multiple
      className={cn("rounded-xl border border-border/70 bg-white/80 px-3", className)}
    >
      <AccordionItem value="faq-1">
        <AccordionTrigger className="text-xs font-semibold text-foreground">
          Do you file for me?
        </AccordionTrigger>
        <AccordionContent className="text-xs text-muted-foreground">
          No. You file and submit on incometax.gov.in yourself. We prepare your values and guide
          every screen to reduce mistakes.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-2">
        <AccordionTrigger className="text-xs font-semibold text-foreground">
          What is companion mode?
        </AccordionTrigger>
        <AccordionContent className="text-xs text-muted-foreground">
          Companion mode is a copy-ready walkthrough that maps your computed tax data to each
          government portal field in filing order.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-3">
        <AccordionTrigger className="text-xs font-semibold text-foreground">
          Which ITR forms are covered?
        </AccordionTrigger>
        <AccordionContent className="text-xs text-muted-foreground">
          Current portal footprint coverage includes ITR-1, ITR-2, ITR-3, and ITR-4, with guided
          screens and full checklist mapping.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-4">
        <AccordionTrigger className="text-xs font-semibold text-foreground">
          Is there a refund guarantee?
        </AccordionTrigger>
        <AccordionContent className="text-xs text-muted-foreground">
          No guaranteed refund claims. We optimize for your maximum lawful outcome based on your
          documents and applicable tax rules.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-5" className="border-b-0">
        <AccordionTrigger className="text-xs font-semibold text-foreground">
          Why not auto-submit directly?
        </AccordionTrigger>
        <AccordionContent className="text-xs text-muted-foreground">
          Government portal submission remains with you for control and transparency. LastMinute
          focuses on correctness, clarity, and confidence while you file.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
