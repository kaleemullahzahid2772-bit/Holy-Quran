import fs from 'fs';
import path from 'path';

const quranPath = path.resolve('node_modules/quran-json/dist/quran.json');
const quran = JSON.parse(fs.readFileSync(quranPath, 'utf8'));

console.log('Total Surahs in verified dataset:', quran.length);
let totalVerses = 0;
let totalWords = 0;

for (const surah of quran) {
  totalVerses += surah.verses.length;
  for (const v of surah.verses) {
    const words = v.text.trim().split(/\s+/);
    totalWords += words.length;
  }
}

console.log('Total Ayahs:', totalVerses);
console.log('Total Words (approx):', totalWords);
