import unicodedata
from fontTools.ttLib import TTFont

f = TTFont('public/fonts/uthmanic_hafs_v22.ttf')
cmap = f.getBestCmap()
glyf = f.get('glyf')

prob = []
for cp, gname in sorted(cmap.items()):
    if gname in ('uni0602', 'uni25CC'):
        prob.append((cp, gname))
    elif glyf and gname in glyf and glyf[gname].isComposite():
        comps = [c.glyphName for c in glyf[gname].components]
        if any('0602' in c or '25cc' in c.lower() for c in comps):
            prob.append((cp, f"{gname} -> {comps}"))

print(f"Total problematic codepoints: {len(prob)}")
for cp, desc in prob:
    uname = unicodedata.name(chr(cp), 'UNKNOWN')
    print(f"U+{cp:04X} ({uname}) -> {desc}")
