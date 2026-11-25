import os
import shutil
import uharfbuzz as hb
from fontTools.ttLib import TTFont

def repair_uthmanic_hafs_v22():
    font_path = 'public/fonts/uthmanic_hafs_v22.ttf'
    backup_path = 'public/fonts/uthmanic_hafs_v22.ttf.bak'
    if not os.path.exists(backup_path):
        shutil.copyfile(font_path, backup_path)
        print(f"Created backup: {backup_path}")

    f = TTFont(font_path)
    glyf = f.get('glyf')
    
    # 1. Identify all codepoints mapped to uni0602 or composite with uni0602
    cmap = f.getBestCmap()
    prob_cps = set()
    for cp, gname in cmap.items():
        if cp == 0x0602:
            continue # Keep genuine footnote marker
        if gname == 'uni0602':
            prob_cps.add(cp)
        elif glyf and gname in glyf and glyf[gname].isComposite():
            comps = [c.glyphName for c in glyf[gname].components]
            if 'uni0602' in comps:
                prob_cps.add(cp)
    
    print(f"Total problematic codepoints to fix in uthmanic_hafs_v22: {len(prob_cps)}")

    # Specific desired mappings for common Urdu / Quranic letters
    desired_mappings = {
        0x0622: 'afii57410', # ARABIC LETTER ALEF WITH MADDA ABOVE
        0x06C1: 'afii57470', # ARABIC LETTER HEH GOAL -> Maps to Arabic Heh (gives full cursive shaping init/medi/fina!)
        0x06C2: 'afii57470', # HEH GOAL WITH HAMZA ABOVE
        0x06C3: 'afii57417', # TEH MARBUTA GOAL -> Maps to Teh Marbuta
        0x06CC: 'afii57450', # FARSI / URDU YEH -> Maps to Arabic Yeh (gives full cursive shaping!)
        0x06A9: 'afii57443', # URDU KEHEH -> Maps to Arabic Kaf (gives full cursive shaping!)
    }

    # Update all cmap tables in font
    for table in f['cmap'].tables:
        if not table.isUnicode():
            continue
        # Apply desired mappings
        for cp, gname in desired_mappings.items():
            table.cmap[cp] = gname
        # Remove remaining fake mappings that were pointing to uni0602
        for cp in prob_cps:
            if cp not in desired_mappings and cp in table.cmap:
                del table.cmap[cp]

    # Save repaired font
    f.save(font_path)
    print("Successfully saved repaired uthmanic_hafs_v22.ttf!")


def repair_uthmanic_hafs_v09():
    font_path = 'public/fonts/UthmanicHafs1-Ver09.otf'
    if not os.path.exists(font_path):
        return
    backup_path = 'public/fonts/UthmanicHafs1-Ver09.otf.bak'
    if not os.path.exists(backup_path):
        shutil.copyfile(font_path, backup_path)
        print(f"Created backup: {backup_path}")

    f = TTFont(font_path)
    glyf = f.get('glyf')
    
    cmap = f.getBestCmap()
    prob_cps = set()
    for cp, gname in cmap.items():
        if cp in (0x0600, 0x0601, 0x0602):
            continue
        if gname in ('uni0600', 'uni0601', 'uni0602'):
            prob_cps.add(cp)
        elif glyf and gname in glyf and glyf[gname].isComposite():
            comps = [c.glyphName for c in glyf[gname].components]
            if any(c in ('uni0600', 'uni0601', 'uni0602') for c in comps):
                prob_cps.add(cp)
    
    print(f"Total problematic codepoints to fix in UthmanicHafs1-Ver09.otf: {len(prob_cps)}")

    desired_mappings = {
        0x0622: 'afii57410',
        0x06C1: 'afii57470',
        0x06C3: 'afii57417',
        0x06CC: 'afii57450',
        0x06A9: 'afii57443',
    }

    for table in f['cmap'].tables:
        if not table.isUnicode():
            continue
        for cp, gname in desired_mappings.items():
            if gname in f.getGlyphOrder():
                table.cmap[cp] = gname
        for cp in prob_cps:
            if cp not in desired_mappings and cp in table.cmap:
                del table.cmap[cp]

    f.save(font_path)
    print("Successfully saved repaired UthmanicHafs1-Ver09.otf!")


def test_repaired_fonts():
    font_path = 'public/fonts/uthmanic_hafs_v22.ttf'
    with open(font_path, 'rb') as fp:
        data = fp.read()
    face = hb.Face(data)
    font = hb.Font(face)
    tt = TTFont(font_path)
    order = tt.getGlyphOrder()

    test_phrases = [
        "البَقَرَة • صفحہ 43",
        "صفحہ",
        "سُورَةُ الفَاتِحَةِ",
        "قَالُوا۟",
        "أَنَا۠",
        "بَصِيرٌۢ",
        "آيَاتُهَا",
        "سیٹنگز و ترتیبات",
        "فہرست قرآنِ کریم",
        "محفوظ شدہ صفحات"
    ]

    print("\n--- Testing Repaired uthmanic_hafs_v22.ttf with HarfBuzz ---")
    for phrase in test_phrases:
        buf = hb.Buffer()
        buf.add_str(phrase)
        buf.guess_segment_properties()
        hb.shape(font, buf)
        glyph_names = [order[info.codepoint] if info.codepoint < len(order) else str(info.codepoint) for info in buf.glyph_infos]
        has_uni0602 = any(gn == 'uni0602' for gn in glyph_names)
        print(f"Phrase: '{phrase}' -> has_uni0602={has_uni0602}, glyphs count={len(glyph_names)}")
        if "صفحہ" in phrase:
            print(f"   Glyphs for '{phrase}': {glyph_names}")

if __name__ == '__main__':
    repair_uthmanic_hafs_v22()
    repair_uthmanic_hafs_v09()
    test_repaired_fonts()
