import json, glob, unicodedata
import uharfbuzz as hb
from fontTools.ttLib import TTFont

font_path = 'public/fonts/uthmanic_hafs_v22.ttf'
with open(font_path, 'rb') as f:
    font_data = f.read()

ttfont = TTFont(font_path)
glyph_order = ttfont.getGlyphOrder()
cmap = ttfont.getBestCmap()
glyf = ttfont.get('glyf')

# Find all suspicious glyph names
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
print(f"Total suspicious glyphs: {len(suspicious_glyphs)}, gids: {len(suspicious_gids)}")

face = hb.Face(font_data)
font = hb.Font(face)

page_files = sorted(glob.glob('public/data/pages/page_*.json'))
print(f"Scanning {len(page_files)} pages with HarfBuzz...")

issues = []

for pf in page_files:
    with open(pf, 'r', encoding='utf-8') as f:
        data = json.load(fp=f)
    pnum = data.get('pageNumber', 0)
    for line in data.get('lines', []):
        lnum = line.get('lineNumber', 0)
        # Check words
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
                gid = info.codepoint
                if gid in suspicious_gids:
                    gname = glyph_order[gid] if gid < len(glyph_order) else str(gid)
                    issues.append({
                        'page': pnum,
                        'line': lnum,
                        'word': text,
                        'wordClean': w.get('textClean', ''),
                        'gid': gid,
                        'gname': gname,
                        'cluster': info.cluster
                    })

print(f"\nTotal shaping issues found in Quran text: {len(issues)}")
if issues:
    print("First 50 issues:")
    for iss in issues[:50]:
        print(f"  Page {iss['page']} Line {iss['line']}: word='{iss['word']}' (clean='{iss['wordClean']}'), glyph={iss['gname']} (gid={iss['gid']})")
