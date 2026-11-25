import json, glob, unicodedata
from fontTools.ttLib import TTFont
from collections import Counter

files = glob.glob('public/data/pages/page_*.json')
char_counter = Counter()
for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for line in data.get('lines', []):
        for word in line.get('words', []):
            t = word.get('text', '')
            for ch in t:
                char_counter[ch] += 1

font_hafs22 = TTFont('public/fonts/uthmanic_hafs_v22.ttf')
cmap22 = font_hafs22.getBestCmap()
glyf22 = font_hafs22.get('glyf')

font_hafs09 = TTFont('public/fonts/UthmanicHafs1-Ver09.otf')
cmap09 = font_hafs09.getBestCmap()

font_scheherazade = TTFont('public/fonts/ScheherazadeNew-Regular.ttf')
cmap_sch = font_scheherazade.getBestCmap()

font_amiri = TTFont('public/fonts/AmiriQuran-Regular.ttf')
cmap_amiri = font_amiri.getBestCmap()

print(f"{'Codepoint':<10} {'Char':<4} {'Count':<7} {'hafs22':<12} {'hafs09':<12} {'scheh':<10} {'amiri':<10} {'Name'}")
print("-" * 90)

for ch, count in sorted(char_counter.items(), key=lambda x: ord(x[0])):
    cp = ord(ch)
    uname = unicodedata.name(ch, 'UNKNOWN')
    
    g22 = cmap22.get(cp, 'MISSING')
    # check if g22 is composite with 0602
    if glyf22 and g22 in glyf22:
        g = glyf22[g22]
        if g.isComposite():
            comps = [c.glyphName for c in g.components]
            if 'uni0602' in comps:
                g22 = 'uni0602!'
            elif 'uni25CC' in comps:
                g22 = 'uni25CC!'
    
    g09 = cmap09.get(cp, 'MISSING')
    gsch = cmap_sch.get(cp, 'MISSING')
    gamiri = cmap_amiri.get(cp, 'MISSING')
    
    if g22 in ('MISSING', 'uni0602!', 'uni25CC!') or g09 == 'MISSING':
        print(f"U+{cp:04X}     {ch:<4} {count:<7} {g22:<12} {g09:<12} {gsch:<10} {gamiri:<10} {uname}")
