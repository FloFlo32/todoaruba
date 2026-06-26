# Knowledge base

This file is the FAQ widget's source of truth. The ingest pipeline overwrites it
with content scraped from the colleague's reference URL (`npm run ingest -- <url> --apply`).
Until then, it holds starter defaults. Keep it concise and factual — the assistant
answers ONLY from what's here.

## About

This site was built on a Next.js + Tailwind + shadcn starter with Impeccable as the
design system. It ships with an AI FAQ assistant and a brand-guide page out of the box.

## FAQ

Q: What is this?
A: A demo of the website starter. Once a project is ingested from a real URL, this
knowledge base is replaced with that brand's real content.

Q: How do I get in touch?
A: Update the contact details in brand.config.ts — the footer and this assistant use them.

Q: Can the assistant answer anything?
A: It only answers from this knowledge base. If something isn't covered here, it will
say so and point you to a human.
