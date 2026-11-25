import os
from fontTools.ttLib import TTFont

fonts_dir = 'public/fonts'
for f in os.listdir(fonts_dir):
    if f.endswith(('.ttf', '.otf')):
        font_path = os.path.join(fonts_dir, f)
        font = TTFont(font_path)
        cmap = font.getBestCmap()
        glyf = font.get('glyf')
        
        # Check what 0x06C1 maps to
        g_6c1 = cmap.get(0x06C1)
        comps = []
        if glyf and g_6c1 in glyf:
            g = glyf[g_6c1]
            if g.isComposite():
                comps = [c.glyphName for c in g.components]
        
        # Count total 0602 or 25cc mappings
        prob_count = 0
        for cp, gname in cmap.items():
            if gname in ('uni0602', 'uni25CC'):
                prob_count += 1
            elif glyf and gname in glyf and glyf[gname].isComposite():
                if any('0602' in c or '25cc' in c.lower() for c in [comp.glyphName for comp in glyf[gname].components]):
                    prob_count += 1
        
        print(f"{f}: cmap={len(cmap)}, 0x06C1={g_6c1} (comps={comps}), total_0602_or_25cc={prob_count}")
