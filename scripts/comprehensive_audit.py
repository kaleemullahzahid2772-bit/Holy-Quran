import json
import glob
import unicodedata
import uharfbuzz as hb
from fontTools.ttLib import TTFont

def run_comprehensive_audit():
    font_path = 'public/fonts/uthmanic_hafs_v22.ttf'
    with open(font_path, 'rb') as fp:
        font_data = fp.read()

    face = hb.Face(font_data)
    font = hb.Font(face)
    tt = TTFont(font_path)
    order = tt.getGlyphOrder()
    cmap = tt.getBestCmap()

    print("=== 1. FONT LEVEL AUDIT ===")
    print(f"Total entries in repaired cmap: {len(cmap)}")
    print(f"0x0622 (آ) mapped to: {cmap.get(0x0622)}")
    print(f"0x06C1 (ہ) mapped to: {cmap.get(0x06C1)}")
    print(f"0x06C3 (ۃ) mapped to: {cmap.get(0x06C3)}")
    print(f"0x06CC (ی) mapped to: {cmap.get(0x06CC)}")
    print(f"0x06A9 (ک) mapped to: {cmap.get(0x06A9)}")

    # Verify no fake mappings to uni0602 exist
    fake_uni0602 = []
    for cp, gn in cmap.items():
        if gn == 'uni0602' and cp != 0x0602:
            fake_uni0602.append((hex(cp), gn))
    print(f"Remaining fake uni0602 mappings (must be 0): {len(fake_uni0602)}")
    assert len(fake_uni0602) == 0, f"Found fake uni0602: {fake_uni0602}"

    print("\n=== 2. AUDIT OF PUBLIC/DATA/PAGES/ (ALL 604 PAGES) ===")
    page_files = sorted(glob.glob('public/data/pages/page_*.json'))
    assert len(page_files) == 604, f"Expected 604 pages, found {len(page_files)}"
    
    total_words = 0
    words_with_space_waqf = 0
    words_with_25cc = 0
    shaping_issues = 0

    for pf in page_files:
        with open(pf, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for line in data.get('lines', []):
            for w in line.get('words', []):
                total_words += 1
                t = w.get('text', '')
                if '\u25cc' in t:
                    words_with_25cc += 1
                if any(' ' + chr(c) in t for c in range(0x06D6, 0x06DD)):
                    words_with_space_waqf += 1
                
                # Shape with HarfBuzz
                if t and not w.get('isAyahMarker'):
                    buf = hb.Buffer()
                    buf.add_str(t)
                    buf.guess_segment_properties()
                    hb.shape(font, buf)
                    for info in buf.glyph_infos:
                        gname = order[info.codepoint]
                        if gname == 'uni0602':
                            shaping_issues += 1

    print(f"Total words checked: {total_words}")
    print(f"Words with space before waqf: {words_with_space_waqf}")
    print(f"Words with U+25CC: {words_with_25cc}")
    print(f"Words shaping to uni0602: {shaping_issues}")
    assert words_with_space_waqf == 0
    assert words_with_25cc == 0
    assert shaping_issues == 0

    print("\n=== 3. AUDIT OF SRC/DATA/QURANPAGES.JSON ===")
    with open('src/data/quranPages.json', 'r', encoding='utf-8') as f:
        src_pages = json.load(f)
    print(f"Loaded {len(src_pages)} pages in src/data/quranPages.json")
    
    src_space_waqf = 0
    for pkey, page in src_pages.items():
        for line in page.get('lines', []):
            for w in line.get('words', []):
                t = w.get('text', '')
                if any(' ' + chr(c) in t for c in range(0x06D6, 0x06DD)):
                    src_space_waqf += 1
    print(f"src/data/quranPages.json space before waqf (must be 0): {src_space_waqf}")
    assert src_space_waqf == 0

    print("\n=== 4. TEST ALL CRITICAL UI PHRASES ===")
    ui_tests = [
        "البَقَرَة • صفحہ 43",
        "صفحہ 43",
        "صفحہ",
        "سُورَةُ البَقَرَةِ",
        "آيَاتُهَا 286",
        "دُعَاءُ خَتْمِ الْقُرْآنِ الْعَظِيمِ",
        "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        "قَالُوا۟",
        "أَنَا۠",
        "بَصِيرٌۢ",
        "رَيْبَۛ",
        "فِيهِۛ",
        "رَّبِّهِمْۖ",
        "سَمْعِهِمْۖ",
        "غِشَـٰوَةٌۭۖ",
        "مَرَضًۭاۖ",
        "ٱلسُّفَهَآءُۗ",
        "ٱلْمَوْتِۚ",
        "سیٹنگز و ترتیبات",
        "فہرست قرآنِ کریم",
        "محفوظ شدہ صفحات"
    ]
    for phrase in ui_tests:
        buf = hb.Buffer()
        buf.add_str(phrase)
        buf.guess_segment_properties()
        hb.shape(font, buf)
        gnames = [order[i.codepoint] for i in buf.glyph_infos]
        assert 'uni0602' not in gnames, f"Failed for '{phrase}' with {gnames}"
        print(f"✓ '{phrase}' shaped cleanly ({len(gnames)} glyphs, 0 black circles)")

    print("\n🎉 ALL TESTS PASSED WITH ZERO BLACK CIRCLES AND 100% CLEAN RENDERING!")

if __name__ == '__main__':
    run_comprehensive_audit()
