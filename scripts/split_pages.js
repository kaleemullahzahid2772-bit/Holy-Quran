import fs from 'fs';
import path from 'path';

console.log('Splitting quranPages.json into lightweight individual page files in public/data/pages/...');

const pagesMap = JSON.parse(fs.readFileSync('src/data/quranPages.json', 'utf8'));
const outDir = path.resolve('public/data/pages');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (let p = 1; p <= 559; p++) {
  const pStr = String(p).padStart(3, '0');
  const pageData = pagesMap[p] || { pageNumber: p, isQuranText: false, lines: [] };
  fs.writeFileSync(path.join(outDir, `page_${pStr}.json`), JSON.stringify(pageData));
}

// Copy pageStatistics and wordOccurrences to public/data/ for fast fetch
fs.copyFileSync('src/data/pageStatistics.json', 'public/data/pageStatistics.json');
fs.copyFileSync('src/data/wordOccurrences.json', 'public/data/wordOccurrences.json');

console.log('✓ Successfully generated 559 individual page JSON files in public/data/pages/!');
