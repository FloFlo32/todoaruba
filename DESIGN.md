name: Aurora Starter
description: A URL-driven website factory that ships sites which don't look AI-built.
colors:
  background: "oklch(0.99 0.004 265)"
  foreground: "oklch(0.18 0.02 265)"
  card: "oklch(1 0 0)"
  primary: "oklch(0.58 0.2 265)"
  primary-foreground: "oklch(0.99 0.01 265)"
  secondary: "oklch(0.96 0.01 265)"
  muted: "oklch(0.96 0.008 265)"
  muted-foreground: "oklch(0.52 0.02 265)"
  accent: "oklch(0.95 0.03 265)"
  destructive: "oklch(0.58 0.22 25)"
  border: "oklch(0.91 0.01 265)"
  background-dark: "oklch(0.16 0.015 265)"
  foreground-dark: "oklch(0.97 0.008 265)"
  primary-dark: "oklch(0.7 0.19 265)"
  aurora-1: "oklch(0.7 0.2 265)"
  aurora-2: "oklch(0.72 0.18 325)"
  aurora-3: "oklch(0.75 0.16 215)"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "0.35rem"
  md: "0.55rem"
  lg: "0.75rem"
  xl: "0.95rem"
  "2xl": "1.15rem"
spacing:
  section: "6rem"
  gutter: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
    padding: "1.5rem"

# Design System: Aurora Starter

## 1. Overview

**Creative North Star: "The Control Panel"**

Aurora is an instrument, not a poster. The system reads like well-made tooling:
measured, precise, quietly confident. Every surface should imply that there is a
real engine underneath — tokens derived from one OKLCH hue, a monospaced detail
language for metadata, crisp focus states — because the product's entire promise is
that it builds sites which *aren't* generic. The design has to prove that claim
about itself first.

It works from a single committed accent (Signal Violet) against near-neutral
surfaces tinted faintly toward the brand hue, so nothing reads as dead gray. Depth
is earned through interaction, not decoration. The voice is a senior engineer with
taste: plain, direct, a little swaggering, never corporate.

This system explicitly rejects the **generic SaaS template** (purple-gradient hero,
hero-metric stat band, endless identical icon+heading+text card grids) and
**AI-builder output** (cream/sand backgrounds, Inter everywhere, a tracked uppercase
eyebrow above every section, `01/02/03` numbered scaffolding). If a screen could be
guessed from the category alone, it has failed.

**Key Characteristics:**

- One committed accent, derived-from-one-hue palette, full dark mode.
- Monospace used as a precise *detail* language (labels, code, metadata) — never as blanket "developer" costume.
- Flat at rest; elevation is a response to state.
- Strong typographic hierarchy over decorative chrome.

## 2. Colors

A near-neutral canvas tinted toward violet, carrying one saturated accent and a
three-stop aurora used only for atmospheric backgrounds.

### Primary

- **Signal Violet** (`oklch(0.58 0.2 265)`; dark `oklch(0.7 0.19 265)`): the single
  brand accent — primary buttons, links, focus rings, active states. Used as a
  *signal*, not a wash. The whole palette is generated from its hue (265), so the
  site re-skins from one number.

### Neutral

- **Ink** (`oklch(0.18 0.02 265)`): primary text on light; faintly violet-tinted, never pure black.
- **Paper** (`oklch(0.99 0.004 265)`) / **Card** (`oklch(1 0 0)`): page and surface backgrounds.
- **Muted Ink** (`oklch(0.52 0.02 265)`): secondary text. Must clear 4.5:1 on Paper.
- **Hairline** (`oklch(0.91 0.01 265)`): borders and dividers.
- Dark theme inverts to **Night** (`oklch(0.16 0.015 265)`) surfaces with light ink.

### Tertiary (atmosphere only)

- **Aurora 1/2/3** (`oklch(0.7 0.2 265)` / `oklch(0.72 0.18 325)` / `oklch(0.75 0.16 215)`):
  blurred background blobs behind heroes/CTAs. Decorative, low-opacity, never text.

### Named Rules

**The One Signal Rule.** Signal Violet is the only saturated color in the content
layer. If two things are violet, neither reads as the action. Reserve it for the
primary action and true brand moments.

**The No Gradient-Text Rule.** Never apply a gradient to text. Emphasis comes from
weight, size, and a single solid color — not `background-clip: text`.

## 3. Typography

**Display Font:** Space Grotesk (fallback sans-serif) — *placeholder; see Don'ts.*
**Body Font:** Geist (fallback ui-sans-serif, system-ui)
**Label/Mono Font:** JetBrains Mono (fallback ui-monospace)

**Character:** A geometric display over a clean grotesque body, with a true mono for
technical detail. The pairing aims for engineered clarity; the mono is what carries
the "Control Panel" voice in labels and metadata.

### Hierarchy

- **Display** (700, `clamp(2.5rem, 6vw, 4.5rem)`, 1.05, `-0.02em`): hero headline only.
- **Headline** (700, `text-4xl`–`5xl`, 1.1): section titles.
- **Title** (600, `text-xl`–`2xl`, 1.3): card and sub-section headings.
- **Body** (400, `1rem`, 1.6, **65–75ch max**): paragraphs; secondary copy uses Muted Ink.
- **Label/Mono** (500, `0.75`–`0.875rem`): metadata, code, kbd, domain chips.

### Named Rules

**The Detail-Mono Rule.** Monospace is for true detail (code, metadata, labels), not
for body or headlines. It signals precision; overused it becomes costume.

## 4. Elevation

Flat by default. Surfaces sit on the page with a 1px hairline border and no shadow at
rest; depth appears only as a **response to state** (hover lift, focus ring, active
press). This deliberately replaces decorative glassmorphism.

### Shadow Vocabulary

- **State lift** (`box-shadow: 0 8px 24px -8px color-mix(in oklch, var(--primary) 25%, transparent)`):
  tinted, soft, on hover of interactive cards/buttons only.
- **Focus ring** (`0 0 0 3px color-mix(in oklch, var(--ring) 45%, transparent)`): keyboard focus.

### Named Rules

**The Flat-By-Default Rule.** No shadow, no backdrop-blur at rest. If a surface is
blurred glass for decoration, remove it. Blur is permitted only where it does real
work (e.g. a sticky nav over scrolling content, the floating widget panel).

## 5. Components

### Buttons

- **Shape:** gently squared (`rounded-md`, 0.55rem).
- **Primary:** Signal Violet fill, primary-foreground text, `0.5rem 1.25rem`.
- **Hover / Focus:** state lift + slight darken on hover; 3px focus ring; `active:scale-[0.98]` press.
- **Secondary / Outline / Ghost:** hairline or transparent; never a second saturated color.

### Cards / Containers

- **Corner Style:** `rounded-2xl` (1.15rem) for feature surfaces, `rounded-xl` for standard.
- **Background:** Card on Paper; in dark, Night-raised.
- **Shadow Strategy:** flat at rest (see Elevation); lift on hover only when interactive.
- **Border:** 1px Hairline at `border-border/60`.
- **Internal Padding:** 1.5rem (`p-6`).

### Inputs / Fields

- **Style:** Paper/Background fill, 1px Hairline (`border-input`), `rounded-lg`.
- **Focus:** 3px Signal-tinted ring; no glow.

### Navigation

- Sticky, transparent at top, hairline + blur **only once scrolled** (functional blur).
- Links in Muted Ink → Ink on hover; one primary CTA button.

### Signature Component — FAQ Widget

Floating launcher (Signal Violet circle) → chat panel. Panel is solid `bg-popover`
(not glass), hairline border, state-lift shadow. Streaming answers; typing indicator
uses a smooth pulse (never bounce).

## 6. Do's and Don'ts

### Do:

- **Do** drive all color from semantic tokens (`bg-primary`, `text-muted-foreground`); re-skin via the one OKLCH hue.
- **Do** keep surfaces flat at rest and earn depth on hover/focus.
- **Do** keep Signal Violet rare — primary action and true brand moments only.
- **Do** use monospace for genuine detail (code, metadata, labels) and ship a real type scale (≥1.25 ratio).
- **Do** verify body text ≥ 4.5:1 in both themes; respect `prefers-reduced-motion` on every animation.

### Don't:

- **Don't** ship the **generic SaaS template**: purple-gradient hero, hero-metric stat band, or endless identical icon+heading+text card grids.
- **Don't** ship **AI-builder tells**: cream/sand backgrounds, a tracked uppercase eyebrow above every section, or `01/02/03` numbered section scaffolding (numbers only when the section truly IS an ordered sequence).
- **Don't** use gradient text (`background-clip: text`) anywhere.
- **Don't** use backdrop-blur "glass" as decoration; blur must do real work.
- **Don't** keep **Space Grotesk** as the display face by default — it's a training-data reflex font. Pick a display face with real voice per the brief before shipping a client site (identity-preservation only applies once a brand has truly committed to one).
- **Don't** put `text-muted-foreground` on `bg-muted`, or any color meaning conveyed by hue alone.
