/**
 * Global site + brand configuration.
 *
 * Anything marked with `TODO(content)` is a placeholder awaiting real
 * information from the client. Keep those markers — `npm run build` surfaces
 * them and AGENT_PROGRESS.md tracks them.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface ContactChannel {
  label: string;
  value: string;
  href: string;
  /** External links get rel="noopener" + an accessible hint. */
  external?: boolean;
  /** True while the value is a placeholder rather than real client data. */
  placeholder?: boolean;
}

export const site = {
  /** Brand */
  name: 'Pepa Dočkal',
  brand: 'jose.ph.otos',
  role: 'Fotograf',
  claim: 'Fotím lidi, co se neradi fotí.',
  location: 'Praha, Brno & kam mě fotky zavedou.',

  /** Defaults for <title> / meta description */
  titleTemplate: '%s — jose.ph.otos',
  defaultTitle: 'Pepa Dočkal — fotograf | jose.ph.otos',
  description:
    'Pepa Dočkal (jose.ph.otos) fotí lidi, co se neradi fotí. Portréty, svatby, koncerty, eventy a produktové fotografie. Praha, Brno a kamkoliv je potřeba.',

  lang: 'cs',
  locale: 'cs_CZ',
} as const;

export const nav: NavItem[] = [
  { label: 'Portfolio', href: '/portfolio/' },
  { label: 'O mně', href: '/o-mne/' },
  { label: 'Ceník', href: '/cenik/' },
  { label: 'Kontakt', href: '/kontakt/' },
];

export const contacts: ContactChannel[] = [
  {
    label: 'E-mail',
    // TODO(content): confirm the real address with the client.
    value: 'ahoj@jose.ph.otos',
    href: 'mailto:ahoj@jose.ph.otos',
    placeholder: true,
  },
  {
    label: 'Instagram',
    value: '@jose.ph.otos',
    href: 'https://www.instagram.com/jose.ph.otos/',
    external: true,
  },
  {
    label: 'Telefon',
    // TODO(content): the client has not supplied a phone number yet.
    value: '+420 000 000 000',
    href: 'tel:+420000000000',
    placeholder: true,
  },
];

/** Channels safe to render publicly right now (placeholders are hidden). */
export const publicContacts = contacts.filter((c) => !c.placeholder);

/**
 * The address to offer as a direct "just write to me" shortcut — but only once
 * it is real. While the e-mail is a placeholder this is `undefined`, and the
 * pages that would have shown it fall back to linking the contact page. A
 * made-up address must never be rendered as if a visitor could use it.
 */
export const directContact = publicContacts.find((c) => c.href.startsWith('mailto:'));
