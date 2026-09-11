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

// 1. Map Surahs 1 to 86 (Pages 2 to 537)
for (let sIdx = 0; sIdx < 86; sIdx++) {
  const surah = SURAHS[sIdx];
  const sWords = wordsBySurah[surah.number] || [];
  const startP = surah.startPage;
  const endP = surah.endPage;

  let wordIdx = 0;
  for (let pageNum = startP; pageNum <= endP; pageNum++) {
    const pageObj = pagesMap[pageNum];
    const isSurahStart = pageNum === startP;

    if (surah.number === 1) {
      pageObj.isIlluminated = true;
      pageObj.lines.push({
        lineNumber: 1,
        isHeader: true,
        headerType: 'surah_title',
        surahNumber: 1,
        surahName: 'الفَاتِحَة',
        nameArabic: 'سُوْرَةُ الْفَاتِحَةِ مَكِّيَّةٌ',
        subtitleArabic: 'آيَاتُهَا ٧  -  رُكُوْعُهَا ١',
        totalAyahs: 7,
        revelationType: 'Makki',
        includeBismillah: false,
        words: []
      });
      pageObj.lines.push({
        lineNumber: 2,
        isHeader: true,
        headerType: 'bismillah',
        words: sWords.slice(0, 4)
      });
      const p2Lines = [
        [sWords[5], sWords[6], sWords[7], sWords[8], sWords[4], sWords[10]],
        [sWords[11], sWords[9], sWords[13], sWords[14], sWords[15], sWords[12]],
        [sWords[17], sWords[18], sWords[19], sWords[20], sWords[16]],
        [sWords[22], sWords[23], sWords[24], sWords[21], sWords[26]],
        [sWords[27], sWords[28], sWords[29], sWords[25], sWords[30]],
        [sWords[31], sWords[32], sWords[33], sWords[34], sWords[35]]
      ];
      p2Lines.forEach((lWords, idx) => {
        const lineNum = idx + 3;
        lWords.forEach(w => { if (!w.isAyahMarker) { w.page = 2; w.line = lineNum; } });
        pageObj.lines.push({ lineNumber: lineNum, isHeader: false, words: lWords });
      });
      wordIdx = sWords.length;
      continue;
    }

    if (surah.number === 2 && pageNum === 3) {
      pageObj.isIlluminated = true;
      pageObj.lines.push({
        lineNumber: 1,
        isHeader: true,
        headerType: 'surah_title',
        surahNumber: 2,
        surahName: 'البَقَرَة',
        nameArabic: 'سُوْرَةُ الْبَقَرَةِ مَدَنِيَّةٌ',
        subtitleArabic: 'آيَاتُهَا ۲۸۶  -  رُكُوْعَاتُهَا ۴۰',
        totalAyahs: 286,
        revelationType: 'Madani',
        includeBismillah: false,
        words: []
      });
      pageObj.lines.push({
        lineNumber: 2,
        isHeader: true,
        headerType: 'bismillah',
        words: []
      });
      const p3Lines = [
        [sWords[0], sWords[1], sWords[2], sWords[3], sWords[4], sWords[5], sWords[6]],
        [sWords[7], sWords[8], sWords[9], sWords[10], sWords[11]],
        [sWords[12], sWords[13], sWords[14], sWords[15]],
        [sWords[16], sWords[17], sWords[18], sWords[19]],
        [sWords[20], sWords[21], sWords[22], sWords[23], sWords[24], sWords[25]],
        [sWords[26], sWords[27], sWords[28], sWords[29], sWords[30], sWords[31]]
      ];
      p3Lines.forEach((lWords, idx) => {
        const lineNum = idx + 3;
        lWords.forEach(w => { if (!w.isAyahMarker) { w.page = 3; w.line = lineNum; } });
        pageObj.lines.push({ lineNumber: lineNum, isHeader: false, words: lWords });
      });
      wordIdx = 32;
      continue;
    }

    const remainingPages = endP - pageNum + 1;
    const remainingWords = sWords.length - wordIdx;
    const wordsForThisPageCount = Math.ceil(remainingWords / remainingPages);
    const pageWords = sWords.slice(wordIdx, wordIdx + wordsForThisPageCount);
    wordIdx += pageWords.length;

    let availableLines = 16 - pageObj.lines.length;
    if (availableLines <= 0) continue;

    if (isSurahStart) {
      pageObj.lines.push({
        lineNumber: pageObj.lines.length + 1,
        isHeader: true,
        headerType: 'surah_title',
        surahNumber: surah.number,
        surahName: surah.nameArabic,
        totalAyahs: surah.totalAyahs,
        revelationType: surah.revelationType,
        includeBismillah: false,
        words: []
      });

      // No separate header Bismillah banner for Surah 1 (Bismillah is Ayah 1) or Surah 9 (At-Tawbah)
      if (surah.number !== 1 && surah.number !== 9) {
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

// 2. Map Page 538 (Surah 87 Al-A'la + Surah 88 Al-Ghashiyah Part 1)
{
  const s87 = SURAHS.find(s => s.number === 87);
  const s87Words = wordsBySurah[87] || [];
  const s88 = SURAHS.find(s => s.number === 88);
  const s88Words = wordsBySurah[88] || [];
  const p538 = pagesMap[538];

  // Surah 87 Header (1 line, combined banner with Bismillah)
  p538.lines.push({
    lineNumber: p538.lines.length + 1,
    isHeader: true,
    headerType: 'surah_title',
    surahNumber: s87.number,
    surahName: s87.nameArabic,
    totalAyahs: s87.totalAyahs,
    revelationType: s87.revelationType,
    includeBismillah: true,
    words: []
  });

  // Surah 87 ayahs 1-19 (9 lines)
  const wordsPerLine87 = Math.ceil(s87Words.length / 9);
  for (let l = 0; l < 9; l++) {
    const lWords = s87Words.slice(l * wordsPerLine87, (l + 1) * wordsPerLine87);
    const lineNum = p538.lines.length + 1;
    lWords.forEach(w => { if (!w.isAyahMarker) { w.page = 538; w.line = lineNum; } });
    p538.lines.push({ lineNumber: lineNum, isHeader: false, words: lWords });
  }

  // Surah 88 Header (1 line, combined banner with Bismillah)
  p538.lines.push({
    lineNumber: p538.lines.length + 1,
    isHeader: true,
    headerType: 'surah_title',
    surahNumber: s88.number,
    surahName: s88.nameArabic,
    totalAyahs: s88.totalAyahs,
    revelationType: s88.revelationType,
    includeBismillah: true,
    words: []
  });

  // Surah 88 ayahs 1-14 (5 lines)
  const s88Part1 = s88Words.filter(w => w.ayah <= 14);
  const wordsPerLine88 = Math.ceil(s88Part1.length / 5);
  for (let l = 0; l < 5; l++) {
    const lWords = s88Part1.slice(l * wordsPerLine88, (l + 1) * wordsPerLine88);
    const lineNum = p538.lines.length + 1;
    lWords.forEach(w => { if (!w.isAyahMarker) { w.page = 538; w.line = lineNum; } });
    p538.lines.push({ lineNumber: lineNum, isHeader: false, words: lWords });
  }
}

// 3. Map Pages 539 to 549 using authentic 16-line multi-surah layout
const PARA30_PAGE_SECTIONS = [
  // Page 539
  { page: 539, surah: 88, ayahs: [15, 26], linesCount: 6, isHeader: false },
  { page: 539, surah: 89, isHeader: true, includeBismillah: true },
  { page: 539, surah: 89, ayahs: [1, 16], linesCount: 9, isHeader: false },

  // Page 540
  { page: 540, surah: 89, ayahs: [17, 30], linesCount: 7, isHeader: false },
  { page: 540, surah: 90, isHeader: true, includeBismillah: true },
  { page: 540, surah: 90, ayahs: [1, 17], linesCount: 8, isHeader: false },

  // Page 541
  { page: 541, surah: 90, ayahs: [18, 20], linesCount: 2, isHeader: false },
  { page: 541, surah: 91, isHeader: true, includeBismillah: true },
  { page: 541, surah: 91, ayahs: [1, 15], linesCount: 7, isHeader: false },
  { page: 541, surah: 92, isHeader: true, includeBismillah: true },
  { page: 541, surah: 92, ayahs: [1, 12], linesCount: 5, isHeader: false },

  // Page 542
  { page: 542, surah: 92, ayahs: [13, 21], linesCount: 5, isHeader: false },
  { page: 542, surah: 93, isHeader: true, includeBismillah: true },
  { page: 542, surah: 93, ayahs: [1, 11], linesCount: 5, isHeader: false },
  { page: 542, surah: 94, isHeader: true, includeBismillah: true },
  { page: 542, surah: 94, ayahs: [1, 8], linesCount: 4, isHeader: false },

  // Page 543
  { page: 543, surah: 95, isHeader: true, includeBismillah: true },
  { page: 543, surah: 95, ayahs: [1, 8], linesCount: 5, isHeader: false },
  { page: 543, surah: 96, isHeader: true, includeBismillah: true },
  { page: 543, surah: 96, ayahs: [1, 19], linesCount: 9, isHeader: false },

  // Page 544
  { page: 544, surah: 97, isHeader: true, includeBismillah: true },
  { page: 544, surah: 97, ayahs: [1, 5], linesCount: 3, isHeader: false },
  { page: 544, surah: 98, isHeader: true, includeBismillah: true },
  { page: 544, surah: 98, ayahs: [1, 8], linesCount: 11, isHeader: false },

  // Page 545
  { page: 545, surah: 99, isHeader: true, includeBismillah: true },
  { page: 545, surah: 99, ayahs: [1, 8], linesCount: 5, isHeader: false },
  { page: 545, surah: 100, isHeader: true, includeBismillah: true },
  { page: 545, surah: 100, ayahs: [1, 11], linesCount: 5, isHeader: false },
  { page: 545, surah: 101, isHeader: true, includeBismillah: true },
  { page: 545, surah: 101, ayahs: [1, 7], linesCount: 3, isHeader: false },

  // Page 546
  { page: 546, surah: 101, ayahs: [8, 11], linesCount: 2, isHeader: false },
  { page: 546, surah: 102, isHeader: true, includeBismillah: true },
  { page: 546, surah: 102, ayahs: [1, 8], linesCount: 4, isHeader: false },
  { page: 546, surah: 103, isHeader: true, includeBismillah: true },
  { page: 546, surah: 103, ayahs: [1, 3], linesCount: 2, isHeader: false },
  { page: 546, surah: 104, isHeader: true, includeBismillah: true },
  { page: 546, surah: 104, ayahs: [1, 9], linesCount: 5, isHeader: false },

  // Page 547
  { page: 547, surah: 105, isHeader: true, includeBismillah: true },
  { page: 547, surah: 105, ayahs: [1, 5], linesCount: 3, isHeader: false },
  { page: 547, surah: 106, isHeader: true, includeBismillah: true },
  { page: 547, surah: 106, ayahs: [1, 4], linesCount: 3, isHeader: false },
  { page: 547, surah: 107, isHeader: true, includeBismillah: true },
  { page: 547, surah: 107, ayahs: [1, 7], linesCount: 4, isHeader: false },
  { page: 547, surah: 108, isHeader: true, includeBismillah: true },
  { page: 547, surah: 108, ayahs: [1, 3], linesCount: 2, isHeader: false },

  // Page 548
  { page: 548, surah: 109, isHeader: true, includeBismillah: true },
  { page: 548, surah: 109, ayahs: [1, 6], linesCount: 3, isHeader: false },
  { page: 548, surah: 110, isHeader: true, includeBismillah: true },
  { page: 548, surah: 110, ayahs: [1, 3], linesCount: 2, isHeader: false },
  { page: 548, surah: 111, isHeader: true, includeBismillah: true },
  { page: 548, surah: 111, ayahs: [1, 5], linesCount: 3, isHeader: false },
  { page: 548, surah: 112, isHeader: true, includeBismillah: true },
  { page: 548, surah: 112, ayahs: [1, 4], linesCount: 2, isHeader: false },

  // Page 549
  { page: 549, surah: 113, isHeader: true, includeBismillah: true },
  { page: 549, surah: 113, ayahs: [1, 5], linesCount: 3, isHeader: false },
  { page: 549, surah: 114, isHeader: true, includeBismillah: true },
  { page: 549, surah: 114, ayahs: [1, 6], linesCount: 3, isHeader: false },
];

for (const sec of PARA30_PAGE_SECTIONS) {
  const pObj = pagesMap[sec.page];
  const surahMeta = SURAHS.find(s => s.number === sec.surah);

  if (sec.isHeader) {
    pObj.lines.push({
      lineNumber: pObj.lines.length + 1,
      isHeader: true,
      headerType: 'surah_title',
      surahNumber: surahMeta.number,
      surahName: surahMeta.nameArabic,
      totalAyahs: surahMeta.totalAyahs,
      revelationType: surahMeta.revelationType,
      includeBismillah: sec.includeBismillah,
      words: []
    });
  } else {
    const [startAyah, endAyah] = sec.ayahs;
    const secWords = wordsBySurah[sec.surah].filter(w => w.ayah >= startAyah && w.ayah <= endAyah);
    const linesCount = sec.linesCount;
    const wordsPerLine = Math.max(1, Math.ceil(secWords.length / linesCount));

    for (let l = 0; l < linesCount; l++) {
      const lineWords = secWords.slice(l * wordsPerLine, (l + 1) * wordsPerLine);
      const lineNum = pObj.lines.length + 1;
      lineWords.forEach(w => {
        if (!w.isAyahMarker) {
          w.page = sec.page;
          w.line = lineNum;
        }
      });
      pObj.lines.push({
        lineNumber: lineNum,
        isHeader: false,
        words: lineWords
      });
    }
  }
}

// Dua Khatm al-Quran for Page 549
const DUA_KHATAM_LINES = [
  'اللَّهُمَّ آنِسْ وَحْشَتِي فِي قَبْرِي',
  'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ الْعَظِيمِ',
  'وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً',
  'اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ',
  'وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ',
  'وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ',
  'صَدَقَ اللّٰهُ الْعَلِیُّ الْعَظِیْمُ وَبَلَّغَ رَسُولُهُ الْکَرِیْمُ'
];

const p549 = pagesMap[549];
p549.lines.push({
  lineNumber: p549.lines.length + 1,
  isHeader: true,
  headerType: 'dua_khatam',
  words: []
});

for (let dIdx = 0; dIdx < DUA_KHATAM_LINES.length; dIdx++) {
  const lineText = DUA_KHATAM_LINES[dIdx];
  const words = lineText.split(' ').map((txt, wIdx) => ({
    id: 990000 + dIdx * 20 + wIdx,
    surah: 114,
    surahName: 'دعاء ختم القرآن',
    ayah: 0,
    position: wIdx + 1,
    text: txt,
    textClean: cleanArabicText(txt),
    characters: txt.split('').map(c => ({ char: c, rules: [], color: '#1e293b' })),
    rules: [],
    tajweedSummary: 'عام تلفظ (Normal)',
    diacritics: countDiacritics(txt),
    page: 549,
    line: p549.lines.length + 1
  }));

  p549.lines.push({
    lineNumber: p549.lines.length + 1,
    isHeader: false,
    words
  });
}

// Fill remaining lines to exactly 16 for all pages 2 to 549
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
