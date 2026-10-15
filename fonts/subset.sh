#!/usr/bin/env bash
# builds the fonts in public/assets/fonts from the full google fonts files next to this script
# needs fonttools with brotli: pip install fonttools brotli
# windsong-medium.woff2 isn't built here, it's already subset to the rank letters
set -euo pipefail

cd "$(dirname "$0")"
out=../public/assets/fonts
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# printable ascii, no-break space, curly quotes and the ellipsis
unicodes='U+0020-007E,U+00A0,U+2018-201F,U+2026'

# nothing sets font-stretch, so the width axis is pinned to its default
for font in instrument-sans instrument-sans-italic; do
    fonttools varLib.instancer -q "$font.woff2" wdth=100 -o "$tmp/$font.ttf"
    pyftsubset "$tmp/$font.ttf" --unicodes="$unicodes" --flavor=woff2 --output-file="$out/$font.woff2"
done

# the writing area only uses the regular weight
fonttools varLib.instancer -q parkinsans.woff2 wght=400 -o "$tmp/parkinsans.ttf"
pyftsubset "$tmp/parkinsans.ttf" --unicodes="$unicodes" --flavor=woff2 --output-file="$out/parkinsans.woff2"
