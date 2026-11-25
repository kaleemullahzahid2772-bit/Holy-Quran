import json
import glob
import unicodedata
from fontTools.ttLib import TTFont

font_uthman = TTFont('public/fonts/uthmanic_hafs_v22.ttf')
cmap = font_uthman.getBestCmap()
glyf = font_uthman.get('glyf')

# Find all codepoints in cmap that resolve to uni0602 or uni25CC
problematic_codepoints = set()
for cp, gname in cmap.items():
    if gname == 'uni0602' or gname == 'uni25CC':
        problematic_codepoints.add(cp)
    elif glyf and gname in glyf:
        g = glyf[gname]
        if g.isComposite():
            comps = [c.glyphName for c in g.components]
            if 'uni0602' in comps or 'uni25CC' in comps:
                problematic_codepoints.add(cp)

print(f"Total problematic codepoints in uthmanic_hafs_v22: {len(problematic_codepoints)}")

# Now scan all 604 pages in public/data/pages/
page_files = sorted(glob.glob('public/data/pages/page_*.json'))
found_in_quran = []

for pf in page_files:
    with open(pf, 'r', encoding='utf-8') as f:
        data = json.load(f)
        page_num = data.get('pageNumber', 0)
        lines = data.get('lines', [])
        for l_idx, line in enumerate(lines):
            words = line.get('words', [])
            for w_idx, w in enumerate(words):
                text = w.get('text', '') or w.get('word', '') or ''
                for i, c in enumerate(text):
                    cp = ord(c)
                    if cp in problematic_codepoints:
                        found_in_quran.append({
                            'page': page_num,
                            'line': l_idx + 1,
                            'word': text,
                            'char': c,
                            'codepoint': hex(cp),
                            'name': unicodedata.name(c, 'UNKNOWN')
                        })

print(f"Occurrences of problematic codepoints in Quran text: {len(found_in_quran)}")
for item in found_in_quran:
    print(item)
