import json, glob, unicodedata

files = sorted(glob.glob('public/data/pages/page_*.json'))
print(f"Scanning {len(files)} files for raw text anomalies...")

space_before_combining = []
standalone_combining = []
waqf_as_word = []
words_with_raw_25cc = []

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    pnum = data.get('pageNumber', 0)
    for line in data.get('lines', []):
        lnum = line.get('lineNumber', 0)
        for w in line.get('words', []):
            t = w.get('text', '')
            if '\u25cc' in t:
                words_with_raw_25cc.append((pnum, lnum, t))
            if any(t == chr(cp) for cp in range(0x06D6, 0x06DD)):
                waqf_as_word.append((pnum, lnum, t, hex(ord(t))))
            # check for space followed by combining mark
            for i in range(len(t) - 1):
                if t[i] == ' ' and unicodedata.category(t[i+1]).startswith('M'):
                    space_before_combining.append((pnum, lnum, t))
            # check if entire word is just combining marks
            if t and all(unicodedata.category(c).startswith('M') for c in t):
                standalone_combining.append((pnum, lnum, t, [hex(ord(c)) for c in t]))

print(f"words_with_raw_25cc: {len(words_with_raw_25cc)}")
print(f"waqf_as_word: {len(waqf_as_word)}")
print(f"space_before_combining: {len(space_before_combining)}")
print(f"standalone_combining: {len(standalone_combining)}")
if standalone_combining:
    for sc in standalone_combining[:20]:
        print(" ", sc)
if waqf_as_word:
    for waw in waqf_as_word[:20]:
        print(" ", waw)
if space_before_combining:
    for sbc in space_before_combining[:20]:
        print(" ", sbc)
