#!/usr/bin/env bash
# Trims the vendored webfonts to the glyphs this site can actually use.
#
# @fontsource ships fonts pre-split by unicode subset, and global.css keeps
# that split (latin + latin-ext, each with its own unicode-range) so a browser
# downloads only what a page needs. Both are needed here — Czech mixes plain
# Latin with Latin Extended-A — so this trims *within* each file instead:
# the latin-ext file also carries Latin Extended Additional, Latin Extended-D
# and phonetic extensions that no Czech or English text will ever reach.
#
# The output is committed to public/fonts/, so this only needs re-running when
# changing the glyph coverage or updating the typefaces:
#
#   pip install fonttools brotli
#   npm install --no-save @fontsource-variable/montserrat @fontsource-variable/bodoni-moda
#   bash scripts/subset-fonts.sh
set -euo pipefail
cd "$(dirname "$0")/.."

for dir in node_modules/@fontsource-variable/montserrat node_modules/@fontsource-variable/bodoni-moda; do
  [ -d "$dir" ] || {
    echo "Missing $dir — run:" >&2
    echo "  npm install --no-save @fontsource-variable/montserrat @fontsource-variable/bodoni-moda" >&2
    exit 1
  }
done
command -v pyftsubset >/dev/null || { echo "pyftsubset not found — run: pip install fonttools brotli" >&2; exit 1; }

# Matches the unicode-range declared for each @font-face in global.css.
LATIN="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,\
U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,\
U+FEFF,U+FFFD"

# Latin Extended-A only: Czech (ěščřžůďťň), Slovak, Polish, Hungarian…
LATIN_EXT="U+0100-017F,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,\
U+0304,U+0308,U+0329,U+2020,U+20A0-20BF,U+2113,U+2C60-2C7F"

subset () {
  local src="$1" out="$2" range="$3" before after
  before=$(stat -c%s "$src")
  pyftsubset "$src" \
    --output-file="$out" \
    --flavor=woff2 \
    --layout-features='kern,liga,clig,calt,ccmp,locl,mark,mkmk' \
    --unicodes="$range" \
    --no-hinting \
    --desubroutinize \
    --drop-tables+=DSIG
  after=$(stat -c%s "$out")
  printf '  %-44s %5d kB -> %4d kB\n' "$(basename "$out")" \
    $((before / 1024)) $((after / 1024))
}

IN_SANS=node_modules/@fontsource-variable/montserrat/files
IN_SERIF=node_modules/@fontsource-variable/bodoni-moda/files

echo "Subsetting fonts:"
subset "$IN_SANS/montserrat-latin-wght-normal.woff2" \
       public/fonts/montserrat-latin-wght-normal.woff2 "$LATIN"
subset "$IN_SANS/montserrat-latin-ext-wght-normal.woff2" \
       public/fonts/montserrat-latin-ext-wght-normal.woff2 "$LATIN_EXT"
subset "$IN_SERIF/bodoni-moda-latin-wght-normal.woff2" \
       public/fonts/bodoni-moda-latin-wght-normal.woff2 "$LATIN"
subset "$IN_SERIF/bodoni-moda-latin-ext-wght-normal.woff2" \
       public/fonts/bodoni-moda-latin-ext-wght-normal.woff2 "$LATIN_EXT"
