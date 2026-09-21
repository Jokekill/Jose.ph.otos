# Design research

> **Status of this document.** The reference sites named in the brief
> (misha.photo, Martin Faltejsek, janhvizdalphotography.com, jansebek.cz,
> davidvancisin.cz) **could not be opened from the build environment** — its
> network policy allows package registries only and answered `403` to every
> other host. So this is not a first-hand visual teardown of those sites.
>
> What it *is*: the design direction derived from (a) the client's own explicit
> statements in the brief, and (b) established conventions of minimal
> photographer portfolios. Everything here is a decision we can defend and
> change.
>
> **Outstanding:** a first-hand pass over the reference sites, ideally with the
> client pointing at specific things they like. See AGENT_PROGRESS.md →
> Open questions. Until then, do not re-run this research — it will hit the
> same wall.

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
7. **Motion is almost absent.** A short fade-and-rise on scroll, a hair of
   scale on hover. Nothing that delays or obstructs a photograph.

## 3. What we use

- **White background** (`#ffffff`) everywhere except the lightbox.
- **Near-black text** (`#101010`) plus two greys for hierarchy.
- **Inter** (variable) for UI and body; **Instrument Serif** for the claim and a
  few large lines. Both self-hosted with latin + latin-ext so Czech diacritics
  render in the real typeface rather than a fallback.
- **Justified gallery rows.** Each photo's flex-basis is proportional to its
  aspect ratio, so a row's photos share one height while each keeps its native
  ratio. No cropping, no JS measuring pass.
- **Full-width anchor photographs** every third landscape, so a gallery has a
  rhythm instead of reading as a contact sheet.
- **A dark lightbox.** The only dark surface on the site — it removes the page
  so the photograph is alone.
- **Text links underlined by a sliding rule**; CTAs are a rule and a word.

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
- `--c-ink-muted` (`#767676`) is the lightest grey allowed on body text
  (4.6:1 on white). `--c-ink-faint` is for large or decorative text only.
- `prefers-reduced-motion` disables reveals, hover scaling and smooth scrolling.
