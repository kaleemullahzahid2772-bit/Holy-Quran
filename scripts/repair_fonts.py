import os
import copy
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
    hmtx = f.get('hmtx')

    # 1. Authentic Quranic Small High Rounded Zero (U+06DF)
    # The font contains 'afii57458' (the authentic 2-contour circular sukun/zero mark)
    # which has complete GPOS Mark-to-Base and Mark-to-Mark anchor attachments for all Arabic letters.
    # We replace uni06DF with afii57458's geometry so whether accessed by cmap, name, or gid,
    # it is always the authentic delicate circular mark.
    g_afii = glyf['afii57458']
    glyf['uni06DF'] = copy.deepcopy(g_afii)
    hmtx['uni06DF'] = hmtx['afii57458']

    # 2. Neutralize all debug / 13-contour placeholder glyphs to 0 contours
    empty_glyph = copy.deepcopy(glyf['uni25CC']) # 0 contours
    bad_glyphs = ['uni0602', 'uni0620', 'uni063F', 'uni065F', 'uni066F', 'gly030', 'uni06E3', 'uni06EB']
    for bad in bad_glyphs:
        if bad in glyf:
            glyf[bad] = copy.deepcopy(empty_glyph)
            hmtx[bad] = (0, 0)

    # 3. Authentic mappings for Quranic marks and Urdu letters
    desired_mappings = {
        0x06DF: 'afii57458', # ARABIC SMALL HIGH ROUNDED ZERO (Uthmanic silent letter mark - 3,988 occurrences)
        0x06E3: 'uni06DC',   # ARABIC SMALL LOW SEEN (Page 525: ٱلْمُصَۣيْطِرُونَ)
        0x06EB: 'afii57458', # ARABIC EMPTY CENTRE HIGH STOP (Page 236: تَأْمَ۫نَّا)
        0x0622: 'afii57410', # ARABIC LETTER ALEF WITH MADDA ABOVE
        0x06C1: 'afii57470', # ARABIC LETTER HEH GOAL -> Maps to Arabic Heh (full cursive shaping)
        0x06C2: 'afii57470', # HEH GOAL WITH HAMZA ABOVE
        0x06C3: 'afii57417', # TEH MARBUTA GOAL
        0x06CC: 'afii57450', # FARSI / URDU YEH
        0x06A9: 'afii57443', # URDU KEHEH
    }

    bad_codepoints = {0x0600, 0x0601, 0x0602, 0x0620, 0x063F, 0x065F, 0x066F}

    # Update all cmap tables in font
    for table in f['cmap'].tables:
        if not table.isUnicode():
            continue
        for cp, gname in desired_mappings.items():
            table.cmap[cp] = gname
        for bad_cp in bad_codepoints:
            if bad_cp in table.cmap:
                del table.cmap[bad_cp]

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
    hmtx = f.get('hmtx')

    g_afii = glyf['afii57458']
    glyf['uni06DF'] = copy.deepcopy(g_afii)
    hmtx['uni06DF'] = hmtx['afii57458']

    empty_glyph = copy.deepcopy(glyf['uni0600'])
    empty_glyph.numberOfContours = 0
    empty_glyph.coordinates = None
    empty_glyph.flags = None
    empty_glyph.endPtsOfContours = None

    for bad in ['uni0600', 'uni0601', 'uni0602', 'gly030']:
        if bad in glyf:
            glyf[bad] = copy.deepcopy(empty_glyph)
            hmtx[bad] = (0, 0)

    desired_mappings = {
        0x06DF: 'afii57458', # ARABIC SMALL HIGH ROUNDED ZERO
        0x06E3: 'uni06DC',   # ARABIC SMALL LOW SEEN
        0x06EB: 'afii57458', # ARABIC EMPTY CENTRE HIGH STOP
        0x0622: 'afii57410',
        0x06C1: 'afii57470',
        0x06C3: 'afii57417',
        0x06CC: 'afii57450',
        0x06A9: 'afii57443',
    }

    bad_codepoints = {0x0600, 0x0601, 0x0602}

    for table in f['cmap'].tables:
        if not table.isUnicode():
            continue
        for cp, gname in desired_mappings.items():
            if gname in f.getGlyphOrder():
                table.cmap[cp] = gname
        for bad_cp in bad_codepoints:
            if bad_cp in table.cmap:
                del table.cmap[bad_cp]

    f.save(font_path)
    print("Successfully saved repaired UthmanicHafs1-Ver09.otf!")


if __name__ == '__main__':
    repair_uthmanic_hafs_v22()
    repair_uthmanic_hafs_v09()
