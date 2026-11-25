import os, re
from fontTools.ttLib import TTFont

font_uthman = TTFont('public/fonts/uthmanic_hafs_v22.ttf')
cmap = font_uthman.getBestCmap()
glyf = font_uthman.get('glyf')

problematic_codepoints = set()
for cp, gname in cmap.items():
    if gname in ('uni0602', 'uni25CC'):
        problematic_codepoints.add(cp)
    elif glyf and gname in glyf:
        g = glyf[gname]
        if g.isComposite():
            comps = [c.glyphName for c in g.components]
            if 'uni0602' in comps or 'uni25CC' in comps:
                problematic_codepoints.add(cp)

files = [
  r"src\components\DesktopSidebar.tsx",
  r"src\components\HomeScreen.tsx",
  r"src\components\NavigationModal.tsx",
  r"src\components\PageDetailsModal.tsx",
  r"src\components\QuranIlluminatedPage.tsx",
  r"src\components\QuranLine.tsx",
  r"src\components\QuranMarginalPanel.tsx",
  r"src\components\QuranPage.tsx",
  r"src\components\QuranStatsModal.tsx",
  r"src\components\QuranWord.tsx",
  r"src\components\SettingsScreen.tsx",
  r"src\components\ThematicIndexModal.tsx",
  r"src\components\WordDetailsModal.tsx"
]

print("=== Checking files for problematic chars in text ===")
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        text = f.read()
    # Check if text contains any problematic codepoint
    found = []
    for idx, c in enumerate(text):
        if ord(c) in problematic_codepoints:
            found.append((hex(ord(c)), c, text[max(0, idx-15):min(len(text), idx+15)].replace('\n', ' ')))
    if found:
        print(f"\nIn {fpath}: {len(found)} occurrences:")
        # deduplicate by snippet
        seen = set()
        for h, c, snip in found:
            if snip not in seen:
                seen.add(snip)
                print(f"  {h} ('{c}'): ...{snip}...")
