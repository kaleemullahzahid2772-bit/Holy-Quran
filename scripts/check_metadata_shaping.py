import json, re, glob
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

def check_text(txt, source=""):
    if not isinstance(txt, str) or not txt:
        return []
    buf = hb.Buffer()
    buf.add_str(txt)
    buf.guess_segment_properties()
    hb.shape(font, buf)
    found = []
    for info in buf.glyph_infos:
        if info.codepoint in suspicious_gids:
            found.append((source, txt, glyph_order[info.codepoint]))
            break
    return found

all_issues = []

# 1. surahsData.ts
with open('src/data/surahsData.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    # match arabic names
    for m in re.finditer(r"nameArabic:\s*['\"]([^'\"]+)['\"]", content):
        all_issues.extend(check_text(m.group(1), f"surahsData.ts nameArabic: {m.group(1)}"))

# 2. quranWordDictionary.ts
with open('src/data/quranWordDictionary.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    for m in re.finditer(r"word:\s*['\"]([^'\"]+)['\"]", content):
        all_issues.extend(check_text(m.group(1), f"quranWordDictionary.ts word: {m.group(1)}"))

# 3. pageThematicData.json
try:
    with open('src/data/pageThematicData.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    for pnum, pinfo in data.items():
        if isinstance(pinfo, dict):
            # check marginalWords
            for mw in pinfo.get('marginalWords', []):
                all_issues.extend(check_text(mw.get('word', ''), f"pageThematicData p{pnum} marginal word"))
                # Note: what about meaningArabic?
                all_issues.extend(check_text(mw.get('meaningArabic', ''), f"pageThematicData p{pnum} meaningArabic"))
except Exception as e:
    print("pageThematicData.json error:", e)

print(f"Total issues found in metadata / dictionaries with uthmanic_hafs_v22: {len(all_issues)}")
for iss in all_issues[:30]:
    print(iss)
