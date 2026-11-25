import json, glob, unicodedata
from collections import Counter

# Let's check public/data/pages/
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

print(f"Total distinct characters in public/data/pages: {len(char_counter)}")
for ch, count in sorted(char_counter.items(), key=lambda x: ord(x[0])):
    cp = ord(ch)
    uname = unicodedata.name(ch, 'UNKNOWN')
    print(f"U+{cp:04X} ({uname}): count={count}, char='{ch}'")
