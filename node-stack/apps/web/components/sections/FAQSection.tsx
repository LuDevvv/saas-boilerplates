"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useGsapReveal } from "@node-stack/ui";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How long does setup take?",
    answer:
      "Under 5 minutes to clone, install, and see the app running locally. The quick-start guide walks you through every step.",
  },
  {
    question: "What license does NodeStack use?",
    answer:
      "MIT license — use it for any project, commercial or otherwise, with no attribution required and no strings attached.",
  },
  {
    question: "What database does it support?",
    answer:
      "PostgreSQL with Drizzle ORM. Row-Level Security (RLS) policies are Postgres-specific and are a core part of the multi-tenant architecture.",
  },
  {
    question: "Where can I deploy this?",
    answer:
      "Anywhere Node.js runs — Railway, Render, Fly.io, AWS, GCP, Azure, or your own VPS. The Docker setup makes it portable by default.",
  },
  {
    question: "How do I get updates?",
    answer:
      "Pull the latest commits from the main branch. Breaking changes are documented in CHANGELOG.md with clear migration notes.",
  },
  {
    question: "Is there commercial support?",
    answer:
      "Community support is available on Discord. Enterprise plans include dedicated support with a named account manager and custom SLAs.",
  },
  {
    question: "Which OAuth providers are supported?",
    answer:
      "Google and GitHub out of the box. You can add more via Passport.js strategies — the auth layer is designed to be extensible.",
  },
  {
    question: "Can I use this for a commercial SaaS?",
    answer:
      "Yes. The MIT license allows full commercial use with no restrictions. Build your product, charge your customers, keep all the revenue.",
  },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────

interface AccordionItemProps {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ item, index, isOpen, onToggle }: AccordionItemProps) {
  const itemId = `faq-answer-${index}`;
  const triggerId = `faq-trigger-${index}`;

  return (
    <div className="border-b border-neutral-200 last:border-none">
      <dt>
        <button
          id={triggerId}
          type="button"
          role="button"
          aria-expanded={isOpen}
          aria-controls={itemId}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm group"
        >
          <span className="font-semibold text-neutral-900 text-sm sm:text-base group-hover:text-primary-700 transition-colors duration-150">
            {item.question}
          </span>
          <ChevronDown
            className={[
              "w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-300",
              isOpen ? "rotate-180 text-primary-500" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>
      </dt>
      <dd
        id={itemId}
        role="region"
        aria-labelledby={triggerId}
        className={[
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-96" : "max-h-0",
        ].join(" ")}
      >
        <p className="pb-5 text-neutral-500 text-sm sm:text-base leading-relaxed">
          {item.answer}
        </p>
      </dd>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const headingRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0, duration: 0.7 });
  const listRef = useGsapReveal<HTMLDListElement>({ direction: "up", delay: 0.15, duration: 0.7 });

  function handleToggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="section bg-white"
    >
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <div ref={headingRef} className="text-center mb-12">
            <p className="text-sm font-semibold text-primary-600 uppercase  mb-3">
              FAQ
            </p>
            <h2
              id="faq-heading"
              className="font-display font-bold text-3xl sm:text-4xl text-neutral-900"
            >
              Frequently asked{" "}
              <span className="gradient-text">questions</span>
            </h2>
            <p className="mt-4 text-neutral-500 text-lg">
              Everything you need to know. Can&apos;t find the answer? Ask on Discord.
            </p>
          </div>

          {/* Accordion */}
          <dl
            ref={listRef}
            className="bg-white rounded-2xl border border-neutral-200 px-6 divide-y-0 shadow-sm"
          >
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={item.question}
                item={item}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => handleToggle(i)}
              />
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
