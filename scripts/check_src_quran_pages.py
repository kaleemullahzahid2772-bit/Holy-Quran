import json
import uharfbuzz as hb
from fontTools.ttLib import TTFont

font_path = 'public/fonts/uthmanic_hafs_v22.ttf'
with open(font_path, 'rb') as f:
    font_data = f.read()

ttfont = TTFont(font_path)
glyph_order = ttfont.getGlyphOrder()
cmap = ttfont.getBestCmap()
glyf = ttfont.get('glyf')

suspicious_glyphs = set()
for gname in glyph_order:
    if '0602' in gname or '25cc' in gname.lower() or 'notdef' in gname.lower() or gname == '.notdef':
        suspicious_glyphs.add(gname)
    elif glyf and gname in glyf:
        g = glyf[gname]
        if g.isComposite():
            comps = [c.glyphName for c in g.components]
            if any('0602' in c or '25cc' in c.lower() for c in comps):
                suspicious_glyphs.add(gname)

suspicious_gids = set(ttfont.getGlyphID(g) for g in suspicious_glyphs)

face = hb.Face(font_data)
font = hb.Font(face)

print("Checking src/data/quranPages.json...")
issues = []
with open('src/data/quranPages.json', 'r', encoding='utf-8') as f:
    pages_dict = json.load(f)

for pkey, p in pages_dict.items():
    pnum = p.get('pageNumber', pkey)
    for line in p.get('lines', []):
        lnum = line.get('lineNumber', 0)
        # Check header texts
        if line.get('isHeader'):
            for field in ['surahName', 'title']:
                val = line.get(field, '')
                if val:
                    buf = hb.Buffer()
                    buf.add_str(val)
                    buf.guess_segment_properties()
                    hb.shape(font, buf)
                    for info in buf.glyph_infos:
                        if info.codepoint in suspicious_gids:
                            issues.append((pnum, lnum, f"header.{field}: {val}", glyph_order[info.codepoint]))
        for w in line.get('words', []):
            if w.get('isAyahMarker'):
                continue
            text = w.get('text', '')
            if not text:
                continue
            buf = hb.Buffer()
            buf.add_str(text)
            buf.guess_segment_properties()
            hb.shape(font, buf)
            for info in buf.glyph_infos:
                if info.codepoint in suspicious_gids:
                    gname = glyph_order[info.codepoint]
                    issues.append((pnum, lnum, text, gname))

print(f"Total issues in src/data/quranPages.json: {len(issues)}")
for iss in issues[:30]:
    print(iss)
