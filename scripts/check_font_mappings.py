import json
import glob
import unicodedata
from fontTools.ttLib import TTFont

font_uthman = TTFont('public/fonts/uthmanic_hafs_v22.ttf')
cmap = font_uthman.getBestCmap()

print(f"Total entries in uthmanic_hafs_v22 cmap: {len(cmap)}")

# Let's inspect all glyphs that have suspicious mappings or components
glyf = font_uthman.get('glyf')
for codepoint, glyph_name in sorted(cmap.items()):
    c = chr(codepoint)
    uname = unicodedata.name(c, 'UNKNOWN')
    # If glyph is composite, check its components
    if glyf and glyph_name in glyf:
        g = glyf[glyph_name]
        if g.isComposite():
            comps = [comp.glyphName for comp in g.components]
            if any('0602' in comp or 'circle' in comp.lower() or '25cc' in comp.lower() for comp in comps):
                print(f"SUSPICIOUS COMPOSITE: U+{codepoint:04X} ({uname}) -> {glyph_name} -> components: {comps}")
        elif g.numberOfContours == 0:
            pass
    # Also check if glyph_name looks like 0602 or dotted
    if '0602' in glyph_name or '25cc' in glyph_name.lower():
        print(f"SUSPICIOUS GLYPH: U+{codepoint:04X} ({uname}) -> {glyph_name}")
