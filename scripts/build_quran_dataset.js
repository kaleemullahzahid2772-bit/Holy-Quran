import fs from 'fs';
import path from 'path';

console.log('=== Starting Quran Dataset & Statistics Generation Pipeline (V2 with Tatweel & Normalization) ===');

const indexPath = path.resolve('node_modules/react-native-quran-tajweed/src/data/index.json');
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const LEGEND = indexData.legend;

const decodeRules = (codes) => codes.map(c => LEGEND[c]).filter(Boolean);

const surahsDataPath = path.resolve('src/data/surahsData.ts');
const surahsFile = fs.readFileSync(surahsDataPath, 'utf8');

const SURAHS = [];
const surahBlockMatch = surahsFile.match(/export const SURAHS_DATA: Surah\[\] = \[([\s\S]*?)\];/);
if (surahBlockMatch) {
  const content = surahBlockMatch[1];
  const items = content.split(/\n\s*\{\s*number:/).filter(Boolean);
  for (const item of items) {
    const raw = item.startsWith('{') ? item : '{ number:' + item;
    const numMatch = raw.match(/number:\s*(\d+)/);
    const arMatch = raw.match(/nameArabic:\s*'([^']+)'/);
    const enMatch = raw.match(/nameEnglish:\s*'([^']+)'/);
    const urMatch = raw.match(/nameUrdu:\s*'([^']+)'/);
    const revMatch = raw.match(/revelationType:\s*'([^']+)'/);
    const ayahsMatch = raw.match(/totalAyahs:\s*(\d+)/);
    const startPMatch = raw.match(/startPage:\s*(\d+)/);
    const endPMatch = raw.match(/endPage:\s*(\d+)/);

    if (numMatch && arMatch && enMatch) {
      SURAHS.push({
        number: parseInt(numMatch[1], 10),
        nameArabic: arMatch[1],
        nameEnglish: enMatch[1],
        nameUrdu: urMatch ? urMatch[1] : '',
        revelationType: revMatch ? revMatch[1] : 'Makki',
        totalAyahs: ayahsMatch ? parseInt(ayahsMatch[1], 10) : 0,
        startPage: startPMatch ? parseInt(startPMatch[1], 10) : 2,
        endPage: endPMatch ? parseInt(endPMatch[1], 10) : 2
      });
    }
  }
}

// Tajweed Color Resolver matching PDF page 558:
function resolveTajweedColor(rules) {
  if (!rules || rules.length === 0) return '#1e293b';
  
  if (rules.some(r => r.startsWith('madda_'))) return '#e11d48'; // Red/Pink
  if (rules.includes('ghunnah')) return '#e11d48'; // Pink/Red
  if (rules.includes('qalaqah')) return '#0284c7'; // Blue/Cyan
  if (rules.some(r => r.startsWith('idgham_'))) return '#ea580c'; // Orange
  if (rules.includes('tafkhim') || rules.includes('ikhafa') || rules.includes('ikhafa_shafawi')) return '#16a34a'; // Green
  
  return '#1e293b';
}

function getTajweedLabel(rules) {
  if (!rules || rules.length === 0) return 'عام تلفظ (Normal)';
  const labels = [];
  if (rules.some(r => r.startsWith('madda_'))) labels.push('مد (Madd)');
  if (rules.includes('ghunnah')) labels.push('غنہ (Ghunnah)');
  if (rules.includes('qalaqah')) labels.push('قلقلہ (Qalqalah)');
  if (rules.some(r => r.startsWith('idgham_'))) labels.push('ادغام (Idgham)');
  if (rules.includes('tafkhim')) labels.push('تفخیم / پر (Heavy Letter)');
  if (rules.includes('ikhafa') || rules.includes('ikhafa_shafawi')) labels.push('اخفاء (Ikhfa)');
  return labels.join(' + ') || 'تجوید';
}

// Clean Arabic text from diacritics, tatweel, and invisible formatting for searching
function cleanArabicText(text) {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u06DF-\u06E4\u0640\u200C\u200D\u200E\u200F\uFEFF]/g, '')
    .replace(/[ٱإأآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

// Count Harakat in a text
function countDiacritics(text) {
  let fatha = 0, kasra = 0, damma = 0;
  let fathatan = 0, kasratan = 0, dammatan = 0;
  let sukoon = 0, shaddah = 0, maddah = 0;
  let standingFatha = 0, standingKasra = 0, invertedDamma = 0;
  let heavyLetters = 0, qalqalah = 0, letters = 0;

  const heavyChars = new Set(['خ', 'ص', 'ض', 'ط', 'ظ', 'غ', 'ق']);
  const qalqalahChars = new Set(['ق', 'ط', 'ب', 'ج', 'د']);

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const code = ch.charCodeAt(0);

    if (code === 0x064E) fatha++;
    else if (code === 0x0650) kasra++;
    else if (code === 0x064F) damma++;
    else if (code === 0x064B) fathatan++;
    else if (code === 0x064D) kasratan++;
    else if (code === 0x064C) dammatan++;
    else if (code === 0x0652 || code === 0x06DF || code === 0x06E1) sukoon++;
    else if (code === 0x0651) shaddah++;
    else if (code === 0x0653 || code === 0x06E4) maddah++;
    else if (code === 0x0670) standingFatha++;
    else if (code === 0x0656) standingKasra++;
    else if (code === 0x0657) invertedDamma++;
    else if (/[\u0621-\u064A\u0671]/.test(ch)) {
      letters++;
      if (heavyChars.has(ch)) heavyLetters++;
      if (qalqalahChars.has(ch)) qalqalah++;
    }
  }

  return {
    letters,
    fatha,
    kasra,
    damma,
    fathatan,
    kasratan,
    dammatan,
    sukoon,
    shaddah,
    maddah,
    standingFatha,
    standingKasra,
    invertedDamma,
    heavyLetters,
    qalqalah
  };
}

// Load all 114 Surahs
const tajweedDataDir = path.resolve('node_modules/react-native-quran-tajweed/src/data');
const allWords = [];
let globalWordId = 1;

for (let sNum = 1; sNum <= 114; sNum++) {
  const sStr = String(sNum).padStart(3, '0');
  const filePath = path.join(tajweedDataDir, `surah_${sStr}.json`);
  const surahJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const surahMeta = SURAHS.find(s => s.number === sNum) || { nameArabic: `سورة ${sNum}` };

  for (const aObj of surahJson.ayahs) {
    const ayahNum = aObj.ayah;
    const segments = aObj.s; // [ [text, [ruleCodes]], ... ]
    
    let currentWordChars = [];
    let currentWordRules = new Set();
    let wordPosInAyah = 1;

    for (const [segText, ruleCodes] of segments) {
      const decodedRules = decodeRules(ruleCodes);
      const charColor = resolveTajweedColor(decodedRules);

      for (let i = 0; i < segText.length; i++) {
        const char = segText[i];
        if (char === ' ') {
          if (currentWordChars.length > 0) {
            const wordFullText = currentWordChars.map(c => c.char).join('');
            const wordClean = cleanArabicText(wordFullText);
            const rulesArr = Array.from(currentWordRules);

            allWords.push({
              id: globalWordId++,
              surah: sNum,
              surahName: surahMeta.nameArabic,
              ayah: ayahNum,
              position: wordPosInAyah++,
              text: wordFullText,
              textClean: wordClean,
              characters: currentWordChars,
              rules: rulesArr,
              tajweedSummary: getTajweedLabel(rulesArr),
              diacritics: countDiacritics(wordFullText)
            });

            currentWordChars = [];
            currentWordRules = new Set();
          }
        } else {
          currentWordChars.push({
            char,
            rules: decodedRules,
            color: charColor
          });
          decodedRules.forEach(r => currentWordRules.add(r));
        }
      }
    }

    if (currentWordChars.length > 0) {
      const wordFullText = currentWordChars.map(c => c.char).join('');
      const wordClean = cleanArabicText(wordFullText);
      const rulesArr = Array.from(currentWordRules);

      allWords.push({
        id: globalWordId++,
        surah: sNum,
        surahName: surahMeta.nameArabic,
        ayah: ayahNum,
        position: wordPosInAyah++,
        text: wordFullText,
        textClean: wordClean,
        characters: currentWordChars,
        rules: rulesArr,
        tajweedSummary: getTajweedLabel(rulesArr),
        diacritics: countDiacritics(wordFullText)
      });
    }

    // Insert Ayah End Marker
    allWords.push({
      isAyahMarker: true,
      surah: sNum,
      ayah: ayahNum,
      markerText: ` ۝${ayahNum.toLocaleString('ar-EG')} `
    });
  }
}

const realWords = allWords.filter(w => !w.isAyahMarker);
console.log(`Total real words extracted across 114 Surahs: ${realWords.length}`);

// Step 4: Map words into the 548 pages (Pages 2 to 549) and exactly 16 lines per page
console.log('Mapping Quran words into 16-Line Layout across Pages 2 to 549...');

const pagesMap = {};
for (let p = 1; p <= 559; p++) {
  pagesMap[p] = {
    pageNumber: p,
    isQuranText: p >= 2 && p <= 549,
    lines: []
  };
}

const wordsBySurah = {};
for (const w of allWords) {
  if (!wordsBySurah[w.surah]) wordsBySurah[w.surah] = [];
  wordsBySurah[w.surah].push(w);
}

for (let sIdx = 0; sIdx < SURAHS.length; sIdx++) {
  const surah = SURAHS[sIdx];
  const sWords = wordsBySurah[surah.number] || [];
  const startP = surah.startPage;
  const endP = surah.endPage;

  let wordIdx = 0;
  for (let pageNum = startP; pageNum <= endP; pageNum++) {
    const pageObj = pagesMap[pageNum];
    const isSurahStart = pageNum === startP;

    const remainingPages = endP - pageNum + 1;
    const remainingWords = sWords.length - wordIdx;
    const wordsForThisPageCount = Math.ceil(remainingWords / remainingPages);
    const pageWords = sWords.slice(wordIdx, wordIdx + wordsForThisPageCount);
    wordIdx += pageWords.length;

    let availableLines = 16 - pageObj.lines.length;
    if (availableLines <= 0) continue;

    if (isSurahStart && pageObj.lines.length === 0) {
      pageObj.lines.push({
        lineNumber: pageObj.lines.length + 1,
        isHeader: true,
        headerType: 'surah_title',
        surahNumber: surah.number,
        surahName: surah.nameArabic,
        totalAyahs: surah.totalAyahs,
        revelationType: surah.revelationType,
        words: []
      });

      if (surah.number !== 9) {
        pageObj.lines.push({
          lineNumber: pageObj.lines.length + 1,
          isHeader: true,
          headerType: 'bismillah',
          words: []
        });
      }
      availableLines = 16 - pageObj.lines.length;
    }

    const linesCount = Math.min(availableLines, 16 - pageObj.lines.length);
    if (linesCount <= 0) continue;

    const wordsPerLine = Math.max(1, Math.ceil(pageWords.length / linesCount));
    for (let l = 0; l < linesCount; l++) {
      const lineWords = pageWords.slice(l * wordsPerLine, (l + 1) * wordsPerLine);
      if (lineWords.length > 0 || pageObj.lines.length < 16) {
        const lineNum = pageObj.lines.length + 1;
        lineWords.forEach(w => {
          if (!w.isAyahMarker) {
            w.page = pageNum;
            w.line = lineNum;
          }
        });

        pageObj.lines.push({
          lineNumber: lineNum,
          isHeader: false,
          words: lineWords
        });
      }
    }
  }
}

for (let p = 2; p <= 549; p++) {
  const pageObj = pagesMap[p];
  while (pageObj.lines.length < 16) {
    pageObj.lines.push({
      lineNumber: pageObj.lines.length + 1,
      isHeader: false,
      words: []
    });
  }
}

console.log('Finished 16-line layout allocation for all 548 pages.');

// Step 5: Compute real Page Statistics for every page
console.log('Calculating authentic Page Statistics for all 559 pages...');
const pageStatistics = {};

for (let p = 1; p <= 559; p++) {
  const pageObj = pagesMap[p];
  if (!pageObj.isQuranText) {
    pageStatistics[p] = {
      pageNumber: p,
      isQuranText: false,
      totalWords: 0,
      totalLetters: 0,
      countFatha: 0,
      countKasra: 0,
      countDamma: 0,
      countFathatan: 0,
      countKasratan: 0,
      countDammatan: 0,
      countSukoon: 0,
      countShaddah: 0,
      countMaddah: 0,
      countStandingFatha: 0,
      countStandingKasra: 0,
      countInvertedDamma: 0,
      countHeavyLetters: 0,
      countQalqalah: 0,
      isCalculated: true
    };
    continue;
  }

  let totalWords = 0;
  let totalLetters = 0;
  let countFatha = 0, countKasra = 0, countDamma = 0;
  let countFathatan = 0, countKasratan = 0, countDammatan = 0;
  let countSukoon = 0, countShaddah = 0, countMaddah = 0;
  let countStandingFatha = 0, countStandingKasra = 0, countInvertedDamma = 0;
  let countHeavyLetters = 0, countQalqalah = 0;

  for (const line of pageObj.lines) {
    for (const w of line.words) {
      if (w.isAyahMarker) continue;
      totalWords++;
      const d = w.diacritics;
      totalLetters += d.letters;
      countFatha += d.fatha;
      countKasra += d.kasra;
      countDamma += d.damma;
      countFathatan += d.fathatan;
      countKasratan += d.kasratan;
      countDammatan += d.dammatan;
      countSukoon += d.sukoon;
      countShaddah += d.shaddah;
      countMaddah += d.maddah;
      countStandingFatha += d.standingFatha;
      countStandingKasra += d.standingKasra;
      countInvertedDamma += d.invertedDamma;
      countHeavyLetters += d.heavyLetters;
      countQalqalah += d.qalqalah;
    }
  }

  pageStatistics[p] = {
    pageNumber: p,
    isQuranText: true,
    totalWords,
    totalLetters,
    countFatha,
    countKasra,
    countDamma,
    countFathatan,
    countKasratan,
    countDammatan,
    countSukoon,
    countShaddah,
    countMaddah,
    countStandingFatha,
    countStandingKasra,
    countInvertedDamma,
    countHeavyLetters,
    countQalqalah,
    isCalculated: true
  };
}

// Step 6: Build Quran-Wide Word Occurrences Index
console.log('Indexing Quran-Wide Word Occurrences...');
const occurrencesIndex = {};

for (const w of realWords) {
  const clean = w.textClean;
  if (!clean) continue;

  if (!occurrencesIndex[clean]) {
    occurrencesIndex[clean] = {
      cleanWord: clean,
      sampleText: w.text,
      totalCount: 0,
      occurrences: []
    };
  }

  occurrencesIndex[clean].totalCount++;
  if (occurrencesIndex[clean].occurrences.length < 50) {
    occurrencesIndex[clean].occurrences.push({
      surah: w.surah,
      surahName: w.surahName,
      ayah: w.ayah,
      page: w.page || 2,
      line: w.line || 1,
      position: w.position
    });
  }
}

console.log(`Unique cleaned words indexed across Quran: ${Object.keys(occurrencesIndex).length}`);
console.log('Occurrence check "الله":', occurrencesIndex['الله']?.totalCount);
console.log('Occurrence check "الرحمن":', occurrencesIndex['الرحمن']?.totalCount);
console.log('Occurrence check "عظيم":', occurrencesIndex['عظيم']?.totalCount);
console.log('Occurrence check "عليم":', occurrencesIndex['عليم']?.totalCount);

// Step 7: Write to src/data/
const outDir = path.resolve('src/data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'quranPages.json'), JSON.stringify(pagesMap));
fs.writeFileSync(path.join(outDir, 'pageStatistics.json'), JSON.stringify(pageStatistics));
fs.writeFileSync(path.join(outDir, 'wordOccurrences.json'), JSON.stringify(occurrencesIndex));

console.log('=== All files successfully generated and written! ===');
