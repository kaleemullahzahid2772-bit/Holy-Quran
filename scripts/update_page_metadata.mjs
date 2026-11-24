import fs from 'fs';

const surahs = {};
for (let p = 1; p <= 604; p++) {
  const f = `public/data/pages/page_${String(p).padStart(3, '0')}.json`;
  if (!fs.existsSync(f)) continue;
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const line of (data.lines || [])) {
    if (line.isHeader && line.headerType === 'surah_title' && line.surahNumber) {
      if (!surahs[line.surahNumber]) {
        surahs[line.surahNumber] = { min: p, max: p };
      } else {
        surahs[line.surahNumber].min = Math.min(surahs[line.surahNumber].min, p);
        surahs[line.surahNumber].max = Math.max(surahs[line.surahNumber].max, p);
      }
    }
    for (const word of (line.words || [])) {
      if (word.surah) {
        if (!surahs[word.surah]) {
          surahs[word.surah] = { min: p, max: p };
        } else {
          surahs[word.surah].min = Math.min(surahs[word.surah].min, p);
          surahs[word.surah].max = Math.max(surahs[word.surah].max, p);
        }
      }
    }
  }
}

const existingSurahsFile = fs.readFileSync('src/data/surahsData.ts', 'utf8');
let updatedSurahs = existingSurahsFile;

for (let s = 1; s <= 114; s++) {
  if (!surahs[s]) continue;
  const { min, max } = surahs[s];
  const regex = new RegExp(`(\\{[^{}]*?number:\\s*${s}\\b[^{}]*?startPage:\\s*)\\d+([^{}]*?endPage:\\s*)\\d+`, 'g');
  updatedSurahs = updatedSurahs.replace(regex, `$1${min}$2${max}`);
}

fs.writeFileSync('src/data/surahsData.ts', updatedSurahs, 'utf8');
console.log('Successfully updated surahsData.ts with authentic 604-page ranges!');

// Authentic 604-page Madani Mushaf Juz (Para) Page Ranges
const JUZ_PAGES = [
  { number: 1, startPage: 1, endPage: 21 },
  { number: 2, startPage: 22, endPage: 41 },
  { number: 3, startPage: 42, endPage: 61 },
  { number: 4, startPage: 62, endPage: 81 },
  { number: 5, startPage: 82, endPage: 101 },
  { number: 6, startPage: 102, endPage: 121 },
  { number: 7, startPage: 122, endPage: 141 },
  { number: 8, startPage: 142, endPage: 161 },
  { number: 9, startPage: 162, endPage: 181 },
  { number: 10, startPage: 182, endPage: 201 },
  { number: 11, startPage: 202, endPage: 221 },
  { number: 12, startPage: 222, endPage: 241 },
  { number: 13, startPage: 242, endPage: 261 },
  { number: 14, startPage: 262, endPage: 281 },
  { number: 15, startPage: 282, endPage: 301 },
  { number: 16, startPage: 302, endPage: 321 },
  { number: 17, startPage: 322, endPage: 341 },
  { number: 18, startPage: 342, endPage: 361 },
  { number: 19, startPage: 362, endPage: 381 },
  { number: 20, startPage: 382, endPage: 401 },
  { number: 21, startPage: 402, endPage: 421 },
  { number: 22, startPage: 422, endPage: 441 },
  { number: 23, startPage: 442, endPage: 461 },
  { number: 24, startPage: 462, endPage: 481 },
  { number: 25, startPage: 482, endPage: 501 },
  { number: 26, startPage: 502, endPage: 521 },
  { number: 27, startPage: 522, endPage: 541 },
  { number: 28, startPage: 542, endPage: 561 },
  { number: 29, startPage: 562, endPage: 581 },
  { number: 30, startPage: 582, endPage: 604 }
];

const existingJuzFile = fs.readFileSync('src/data/juzData.ts', 'utf8');
let updatedJuz = existingJuzFile;

for (const j of JUZ_PAGES) {
  const regex = new RegExp(`(\\{[^{}]*?number:\\s*${j.number}\\b[^{}]*?startPage:\\s*)\\d+([^{}]*?endPage:\\s*)\\d+`, 'g');
  updatedJuz = updatedJuz.replace(regex, `$1${j.startPage}$2${j.endPage}`);
}

fs.writeFileSync('src/data/juzData.ts', updatedJuz, 'utf8');
console.log('Successfully updated juzData.ts with authentic 604-page ranges!');
