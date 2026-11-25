import json
import glob
import re

def sanitize_text(text: str) -> str:
    if not text:
        return text
    # Remove literal dotted circles U+25CC if any
    cleaned = text.replace('\u25cc', '')
    # Remove any space or zero-width spaces/joiners preceding waqf marks (\u06D6 through \u06DC)
    cleaned = re.sub(r'[\s\u200C\u200D\uFEFF\u00A0]+([\u06D6-\u06DC])', r'\1', cleaned)
    return cleaned

def process_public_pages():
    files = sorted(glob.glob('public/data/pages/page_*.json'))
    print(f"Sanitizing {len(files)} files in public/data/pages/...")
    modified_files = 0
    total_words_fixed = 0

    for fpath in files:
        with open(fpath, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
        
        file_changed = False
        for line in data.get('lines', []):
            for w in line.get('words', []):
                original = w.get('text', '')
                sanitized = sanitize_text(original)
                if sanitized != original:
                    w['text'] = sanitized
                    file_changed = True
                    total_words_fixed += 1
        
        if file_changed:
            with open(fpath, 'w', encoding='utf-8') as fp:
                json.dump(data, fp, ensure_ascii=False, indent=2)
            modified_files += 1

    print(f"public/data/pages: {modified_files} files modified, {total_words_fixed} words cleaned.")

def process_src_quran_pages():
    fpath = 'src/data/quranPages.json'
    print(f"Sanitizing {fpath}...")
    with open(fpath, 'r', encoding='utf-8') as fp:
        pages = json.load(fp)

    total_words_fixed = 0
    for pkey, page in pages.items():
        for line in page.get('lines', []):
            for w in line.get('words', []):
                original = w.get('text', '')
                sanitized = sanitize_text(original)
                if sanitized != original:
                    w['text'] = sanitized
                    total_words_fixed += 1

    with open(fpath, 'w', encoding='utf-8') as fp:
        json.dump(pages, fp, ensure_ascii=False)
    print(f"src/data/quranPages.json: {total_words_fixed} words cleaned.")

if __name__ == '__main__':
    process_public_pages()
    process_src_quran_pages()
