/**
 * The "O mně" page.
 *
 * ⚠️ THE FINAL TEXT HAS NOT BEEN SUPPLIED BY THE CLIENT.
 *
 * What is written below is deliberately limited to things we actually know
 * from the brief — the claim, the places, the kinds of work. No invented
 * biography, no invented career history, no invented gear list.
 *
 * `textConfirmed: false` makes the page show a visible notice that the text is
 * a draft. Flip it to true once Pepa has approved or rewritten the copy.
 */

export const about = {
  textConfirmed: false,

  /** Shown large at the top of the page. */
  lead: 'Fotím lidi. Nejradši ty, co si o sobě myslí, že se fotit neumí.',

  paragraphs: [
    'Jsem Pepa Dočkal a fotím pod značkou jose.ph.otos. Většina lidí, které fotím, mi na začátku řekne nějakou variantu věty „já se fotím strašně nerad“. To je v pohodě. Znamená to jen, že první čtvrthodina bude o povídání a ne o pózování.',
    'Nejčastěji mě potkáte u portrétů, na svatbách, na koncertech a na kulturních i firemních akcích. Občas fotím produkty, občas rodinu, občas město. Spojuje to jedno — snažím se, aby fotka vypadala jako skutečný moment, ne jako inscenace.',
    'Pracuji hlavně v Praze a v Brně, ale za dobrým focením vyrazím kamkoliv.',
  ],

  /** Short factual list. Keep it to things we can stand behind. */
  facts: [
    { label: 'Kde fotím', value: 'Praha, Brno a kamkoliv je potřeba' },
    { label: 'Co fotím', value: 'Portréty, svatby, koncerty, eventy, produkty' },
    { label: 'Instagram', value: '@jose.ph.otos' },
  ],

  /**
   * TODO(content): questions for the client, mirrored in AGENT_PROGRESS.md.
   */
  openQuestions: [
    'Vlastní text „O mně“ — kolik toho o sobě chce Pepa prozradit?',
    'Je k dispozici portrét fotografa pro tuto stránku?',
    'Chce uvést vzdělání / zkušenosti / reference klientů?',
  ],
} as const;
