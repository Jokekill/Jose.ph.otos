# Design research

> **Status of this document.**
>
> The reference sites still cannot be opened from the build environment — its
> network policy allows package registries only and answers `403` to every
> other host. **However, the client supplied a saved copy of misha.photo**, so
> section 1b below is measured from that page's real CSS rather than guessed.
>
> Martin Faltejsek's site has never been supplied as a URL and remains
> un-analysed. The three secondary references are likewise unseen.

---

## 1b. misha.photo — measured from the client's saved copy

This is fact, read out of the page's stylesheet, not interpretation.

### Typefaces

| Font | Uses | Role |
| --- | --- | --- |
| **Montserrat** | 77 | Almost everything: body, labels, subheadings |
| Noir et Blanc Regular | 5 | Main menu, one footer heading |
| Butler Light | 3 | A few display lines in the footer |

The site is, in practice, **a Montserrat site** with two accent faces used in a
handful of places.

```
st-d-paragraph   Montserrat 300 · 14px · lh 1.6 · tracking 0.03em
st-d-subheading  Montserrat 400 · 14px · lh 1.6 · tracking 0.2em · UPPERCASE
st-d-title       36px · lh 1.4 · tracking 0em
st-d-heading     26px · lh 1.4 · tracking -0.05em
menu             Noir 400 · 22px · tracking 0.2em
footer heading   Noir 400 · 45px · tracking 0.3em
```

Tracking distribution across the whole page: `0.2em` (56×), `0em` (10×),
`0.03em` (2×), `0.3em` (2×). **Wide-tracked uppercase is the single strongest
signature of the design** — more than the choice of typeface itself.

### Motion

The entire site's animation vocabulary:

- **One duration: `0.5s`** — 280 occurrences, no exceptions.
- **Animated properties: `opacity` (188), `color` (77), `fill` (10).** Nothing
  else. No `transform` transitions at all.
- **No `@keyframes` anywhere. No timing function declared**, so everything runs
  on the browser default `ease`.
- Hover on a text link: `text-decoration: underline` plus a colour change.

So: it does not move, it fades. Scale, slide and rise are absent entirely.

### What we took, and what we did not

- **Took:** Montserrat (OFL, so we self-host the genuine article), the light
  weight for running text, the 0.2em uppercase tracking, the 0.5s
  opacity-and-colour-only motion vocabulary.
- **Did not take:** Noir et Blanc and Butler. Their `.woff` files are served
  from that site's builder CDN and licensed to it — copying them onto a
  different domain is not ours to do. Bodoni Moda (OFL) stands in for Butler
  in the same minor display role.
- **Did not take:** the builder's background parallax (`bgScroll: "p"`). The
  brief rules out aggressive parallax and the client asked for restraint.
- **Added:** wider reach and a stagger. The reference fades a handful of
  elements; we fade section heads, galleries, pricing rows and contact
  details, cascaded 90ms apart. More things move, in the same language.

---

## 1. What the client actually said

These are direct constraints, not interpretation:

| Statement | Consequence for the design |
| --- | --- |
| "Chtěl bych, aby ty fotky byly na bílém podkladu, jako mám na Instagramu." | Pure white page background. UI in near-black + neutral greys. **Hard requirement.** |
| misha.photo — "tohle je něco, kam bych to chtěl směřovat" | Minimal, photography-first, heavy whitespace, very little UI. |
| Martin Faltejsek — "vizuálně se mi moc líbí" | Restraint. Few elements, confident typography. |
| "Fotím lidi, co se neradi fotí." | The claim is identity, not marketing garnish. It belongs on the homepage, set large. |
| "Praha, Brno & kam mě fotky zavedou." | Location stated plainly, never as a fake "service area" block. |
| Ceník is explicitly wanted | Pricing is a first-class page, not a hidden note. |

## 2. Principles we are designing to

1. **The photograph is the interface.** If an element does not help a
   photograph, an orientation task, or the brand, it does not ship.
2. **White is the frame.** The site is a gallery wall. Colour arrives only in
   the photographs. No tinting, no CSS filters over photos, no forced grayscale.
3. **Whitespace is structural**, not decoration. Section rhythm scales with the
   viewport (`--section-gap`), so a phone gets air too.
4. **One typographic voice.** A neutral grotesk for everything functional, a
   serif reserved for the few display moments. Not ten weights.
5. **Native aspect ratios are preserved.** Portraits stay portrait. Nothing is
   cropped into a uniform grid to make a layout tidy.
6. **Mobile is the primary design target**, not a shrunken desktop.
7. **Motion is almost absent, and it only ever fades.** Opacity and colour at
   0.5s — measured from the reference, which animates nothing else. No rise,
   no scale, no parallax. Nothing that delays or obstructs a photograph.

## 3. What we use

- **White background** (`#ffffff`) everywhere except the lightbox.
- **Near-black text** (`#101010`) plus two greys for hierarchy.
- **Montserrat** (variable, light 300 for running text) for everything, with
  **Bodoni Moda** as the display accent — the same split the reference uses.
  Both self-hosted and subset to latin + latin-ext, so Czech diacritics render
  in the real typeface rather than a fallback.
- **Uppercase labels and navigation tracked at 0.2em.** This one value carries
  most of the reference's character.
- **Justified gallery rows.** Each photo's flex-basis is proportional to its
  aspect ratio, so a row's photos share one height while each keeps its native
  ratio. No cropping, no JS measuring pass.
- **Full-width anchor photographs** every third landscape, so a gallery has a
  rhythm instead of reading as a contact sheet.
- **A dark lightbox.** The only dark surface on the site — it removes the page
  so the photograph is alone.
- **Text links underlined by a sliding rule**; CTAs are a rule and a word.
- **An inset hairline on every photograph** (`rgba(16,16,16,0.07)`). Invisible
  over a dark frame; it stops a high-key photograph — a product on white, a
  bright wedding frame — from dissolving into the white page and reading as an
  empty slot. Costs no layout space and is not card UI.

## 4. What we deliberately do not use

Taken from the brief's "čemu se vyhnout", plus our own calls:

- gradients, glassmorphism, neon accents
- card UI with borders, shadows and rounded corners around photos
- icon sets (the lightbox arrows and the menu rules are the entire icon budget)
- parallax, intro animations, page-transition tricks
- large marketing copy blocks or a hero that delays the first photograph
- a "hamburger → slide-down dropdown". The mobile menu is a full white sheet.
- automatic grayscale over colour photographs

## 5. Layout decisions

| Element | Decision |
| --- | --- |
| Page shell | `--w-site: 1680px`, galleries `--w-wide: 1440px`, text `--w-content: 1080px`, running prose capped at `62ch` |
| Header | Sticky, white, no border until the page scrolls — nothing frames the first photograph |
| Homepage | Four lines of masthead (name/role, claim, place), then immediately a large hero photograph |
| Portfolio landing | Alternating wide photo / text rows, sides swapping down the page. No cards |
| Gallery | Justified rows on tablet and up; one full-width photo per row on phones |
| Category page | Breadcrumb, title, one paragraph, then photographs. A "next category" link at the end |
| Footer | Brand block + three link columns, separated by a single hairline |

## 6. Mobile findings

Decided against a scaled-down desktop:

- **One photograph per row below 48rem.** A justified row of two portraits at
  360px is unreadable, and big photographs are the entire point.
- **Full-screen white navigation sheet**, links set at ~2rem, staggered in.
  A dropdown at that type size would be cramped.
- **44px minimum touch targets** on the menu toggle and every lightbox control.
- **Lightbox arrows are hidden on touch** (`hover: none and pointer: coarse`) —
  they would sit on top of the photograph. Swiping replaces them, and the
  `n / total` counter keeps the position legible.
- **Vertical flick closes the lightbox**, matching what people expect from
  native photo viewers.
- `env(safe-area-inset-bottom)` respected on the lightbox bar.
- The homepage hero is capped at `78svh` so the first screen is never
  a single photograph with no context.

## 7. Typography scale

Fluid via `clamp()` between 360px and 1440px, so there is no breakpoint where
type jumps. Display type is tightly tracked (`-0.03em`); small uppercase labels
are loosely tracked (`0.09em`). These two treatments plus body text carry the
whole site.

## 8. Accessibility positions taken

- Semantic landmarks, one `<h1>` per page, ordered headings.
- Every photograph carries an `alt`; a photograph that is a lightbox trigger
  gets its description on the button and an empty `alt` on the image, so
  screen readers announce it once rather than twice.
- The lightbox is a labelled `role="dialog"` with focus moved in, focus
  trapped, and focus restored to the photograph that opened it.
- `--c-ink-muted` (`#6b6b6b`, 5.3:1 on white) is the lightest grey allowed on
  body text. It was originally `#767676`, which measures 4.54:1 — technically
  over the 4.5:1 bar, but it rounds under once composited, so axe failed it on
  13px text. Leave real headroom. `--c-ink-faint` is for large or decorative
  text only, never for running text.
- `prefers-reduced-motion` disables reveals, hover scaling and smooth scrolling.
