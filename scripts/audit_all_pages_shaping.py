import glob, json
import uharfbuzz as hb
from fontTools.ttLib import TTFont

font_path = 'public/fonts/uthmanic_hafs_v22.ttf'
with open(font_path, 'rb') as f:
    font_data = f.read()

ttfont = TTFont(font_path)
order = ttfont.getGlyphOrder()
face = hb.Face(font_data)
font = hb.Font(face)

files = sorted(glob.glob('public/data/pages/page_*.json'))
print(f'Auditing all {len(files)} Quran page files...')

bad_glyphs = {'uni0600', 'uni0601', 'uni0602', 'uni25CC', '.notdef', 'gly030'}
total_words = 0
total_issues = 0
total_zero_marks = 0
issues_list = []

for pf in files:
    with open(pf, 'r', encoding='utf-8') as fp:
        page = json.load(fp)
    pnum = page.get('pageNumber', 0)
    for line in page.get('lines', []):
        lnum = line.get('lineNumber', 0)
        for w in line.get('words', []):
            if w.get('isAyahMarker'):
                continue
            text = w.get('text', '')
            if not text:
                continue
            total_words += 1
            if '\u06df' in text:
                total_zero_marks += text.count('\u06df')
            
            buf = hb.Buffer()
            buf.add_str(text)
            buf.guess_segment_properties()
            hb.shape(font, buf)
            
            gnames = [order[i.codepoint] if i.codepoint < len(order) else str(i.codepoint) for i in buf.glyph_infos]
            for gn in gnames:
                if gn in bad_glyphs:
                    issues_list.append((pnum, lnum, text, gn))
                    total_issues += 1

print('\n=== AUDIT RESULTS ===')
print(f'Total Quran words checked: {total_words}')
print(f'Total U+06DF (Rounded Zero) marks checked: {total_zero_marks}')
print(f'Total bad/dotted glyphs or .notdef found: {total_issues}')
if issues_list:
    for iss in issues_list[:20]:
        print(f'  Page {iss[0]} Line {iss[1]}: word="{iss[2]}" -> glyph {iss[3]}')
