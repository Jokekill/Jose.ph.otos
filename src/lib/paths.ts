/**
 * Build an internal URL that respects `base` from astro.config.mjs, so the
 * same source works on a GitHub Pages project site and on a custom domain.
 */
export function path(href: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = href.startsWith('/') ? href : `/${href}`;
  return `${base}${clean}` || '/';
}

/** True when `href` is the current page (or an ancestor section of it). */
export function isActive(href: string, pathname: string): boolean {
  const target = path(href);
  if (target === path('/')) return pathname === target;
  return pathname === target || pathname.startsWith(target);
}
