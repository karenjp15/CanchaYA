"use client";

import * as React from "react";
import { Accordion } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function AccordionRoot({
  className,
  ...props
}: React.ComponentProps<typeof Accordion.Root>) {
  return (
    <Accordion.Root
      className={cn(
        "divide-y divide-border rounded-xl border border-border",
        className,
      )}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof Accordion.Item>) {
  return (
    <Accordion.Item
      className={cn(
        "overflow-hidden first:rounded-t-xl last:rounded-b-xl",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Accordion.Trigger>) {
  return (
    <Accordion.Header className="flex">
      <Accordion.Trigger
        className={cn(
          "flex min-w-0 flex-1 items-start justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 data-panel-open:bg-muted/30 sm:items-center",
          className,
        )}
        {...props}
      >
        <span className="min-w-0 flex-1 text-balance pr-1 leading-snug">
          {children}
        </span>
        <ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 data-panel-open:rotate-180 sm:mt-0" />
      </Accordion.Trigger>
    </Accordion.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Accordion.Panel>) {
  return (
    <Accordion.Panel
      className={cn(
        "overflow-hidden text-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    >
      <div className="border-t border-border bg-muted/10 px-3 py-3 sm:px-4">
        {children}
      </div>
    </Accordion.Panel>
  );
}

export {
  AccordionRoot as Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
