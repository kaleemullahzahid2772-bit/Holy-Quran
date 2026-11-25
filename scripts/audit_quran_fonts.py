import json
import os
import glob
import unicodedata
from fontTools.ttLib import TTFont

def main():
    print("Loading uthmanic_hafs_v22.ttf...")
    font_uthman = TTFont('public/fonts/uthmanic_hafs_v22.ttf')
    cmap = font_uthman.getBestCmap()

    # Load all 604 pages
    page_files = sorted(glob.glob('public/data/pages/page_*.json'))
    print(f"Found {len(page_files)} page files in public/data/pages/")

    all_chars = set()
    combining_issues = []
    unsupported_chars = set()
    words_with_dotted_circle = []
    chars_frequency = {}

    for pf in page_files:
        try:
            with open(pf, 'r', encoding='utf-8') as f:
                data = json.load(f)
                lines = data.get('lines', [])
                for l_idx, line in enumerate(lines):
                    words = line.get('words', [])
                    for w_idx, w in enumerate(words):
                        text = w.get('text', '') or w.get('word', '') or ''
                        for c in text:
                            all_chars.add(c)
                            chars_frequency[c] = chars_frequency.get(c, 0) + 1
                            if ord(c) not in cmap:
                                unsupported_chars.add((c, hex(ord(c)), unicodedata.name(c, 'UNKNOWN')))
                        
                        # check for standalone combining marks or strange sequences
                        for i, c in enumerate(text):
                            cat = unicodedata.category(c)
                            if cat.startswith('M') and i == 0:
                                combining_issues.append((data.get('pageNumber', pf), text, c, hex(ord(c))))
                            if c == '\u25cc':
                                words_with_dotted_circle.append((data.get('pageNumber', pf), text))
        except Exception as e:
            print(f"Error reading {pf}: {e}")

    print(f"Unique characters in Quran text: {len(all_chars)}")
    print(f"Unsupported characters count in uthmanic_hafs_v22: {len(unsupported_chars)}")
    for c, h, n in sorted(unsupported_chars, key=lambda x: x[1]):
        print(f"  {h}: {n} (char: '{c}', freq: {chars_frequency.get(c, 0)})")

    print(f"\nWords starting with combining mark: {len(combining_issues)}")
    for ci in combining_issues[:30]:
        print(f"  Page {ci[0]}: word \"{ci[1]}\" starts with {ci[2]} ({ci[3]})")

    print(f"\nWords with explicit U+25CC: {len(words_with_dotted_circle)}")

if __name__ == '__main__':
    main()
