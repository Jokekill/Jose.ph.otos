import type { Photo } from './portfolio';

/**
 * THE REAL PORTFOLIO.
 *
 * Empty until Pepa's photographs are added to the repository. As soon as this
 * array has entries, the whole site switches away from demo content
 * automatically (see `usingDemoContent` in ./portfolio.ts).
 *
 * To add a photograph:
 *   1. Put the file in `src/assets/portfolio/<category>/<name>.jpg`
 *   2. Add an entry below with a real `alt` text
 *   3. Mark one `cover: true` per category and one `hero: true` overall
 *
 * Do NOT set `placeholder: true` here — that flag is for demo assets only.
 */
export const realPhotos: Photo[] = [];
