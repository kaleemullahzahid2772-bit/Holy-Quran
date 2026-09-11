import fs from 'fs';
import path from 'path';

console.log('=== Starting Authentic 16-Line Quran Dataset Pipeline ===');

// 1. Load Surahs & Juz metadata
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
console.log(`Loaded ${SURAHS.length} Surahs metadata.`);

// 2. Load Tajweed Legend & Rules Decoder
const indexPath = path.resolve('node_modules/react-native-quran-tajweed/src/data/index.json');
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const LEGEND = indexData.legend;
const decodeRules = (codes) => codes.map(c => LEGEND[c]).filter(Boolean);

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

function cleanArabicText(text) {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u06DF-\u06E4\u0640\u200C\u200D\u200E\u200F\uFEFF]/g, '')
    .replace(/[ٱإأآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

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

// 3. Load all 114 Surahs words into global dictionary
console.log('Loading all 114 Surahs from tajweed dataset...');
const wordsMap = new Map();
let globalWordId = 1;

for (let sNum = 1; sNum <= 114; sNum++) {
  const sStr = String(sNum).padStart(3, '0');
  const filePath = path.resolve(`node_modules/react-native-quran-tajweed/src/data/surah_${sStr}.json`);
  if (!fs.existsSync(filePath)) continue;
  const sJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const surahMeta = SURAHS.find(s => s.number === sNum) || { nameArabic: '' };

  for (const aObj of sJson.ayahs) {
    const aNum = aObj.ayah;
    let wordPos = 1;
    let curChars = [];
    let curRules = new Set();

    for (const [segText, segRules] of aObj.s) {
      const decodedRules = decodeRules(segRules);
      const color = resolveTajweedColor(decodedRules);

      for (let i = 0; i < segText.length; i++) {
        const ch = segText[i];
        if (ch === ' ') {
          if (curChars.length > 0) {
            const wText = curChars.map(c => c.char).join('');
            const wordObj = {
              id: globalWordId++,
              surah: sNum,
              surahName: surahMeta.nameArabic,
              ayah: aNum,
              position: wordPos,
              text: wText,
              textClean: cleanArabicText(wText),
              characters: curChars,
              rules: Array.from(curRules),
              tajweedSummary: getTajweedLabel(Array.from(curRules)),
              diacritics: countDiacritics(wText)
            };
            wordsMap.set(`${sNum}:${aNum}:${wordPos}`, wordObj);
            wordPos++;
            curChars = [];
            curRules = new Set();
          }
        } else {
          curChars.push({ char: ch, rules: decodedRules, color });
          decodedRules.forEach(r => curRules.add(r));
        }
      }
    }

    if (curChars.length > 0) {
      const wText = curChars.map(c => c.char).join('');
      const wordObj = {
        id: globalWordId++,
        surah: sNum,
        surahName: surahMeta.nameArabic,
        ayah: aNum,
        position: wordPos,
        text: wText,
        textClean: cleanArabicText(wText),
        characters: curChars,
        rules: Array.from(curRules),
        tajweedSummary: getTajweedLabel(Array.from(curRules)),
        diacritics: countDiacritics(wText)
      };
      wordsMap.set(`${sNum}:${aNum}:${wordPos}`, wordObj);
    }
  }
}
console.log(`Loaded ${wordsMap.size} colored Tajweed words in dictionary.`);

// Helper to look up a word with fallback
function getWordData(surah, ayah, position, fallbackText) {
  const key = `${surah}:${ayah}:${position}`;
  let word = wordsMap.get(key);
  if (!word) word = wordsMap.get(`${surah}:${ayah}:${position - 1}`);
  if (!word) word = wordsMap.get(`${surah}:${ayah}:${position + 1}`);
  if (!word) {
    // Construct minimal fallback word
    const surahMeta = SURAHS.find(s => s.number === surah) || { nameArabic: '' };
    word = {
      id: globalWordId++,
      surah,
      surahName: surahMeta.nameArabic,
      ayah,
      position,
      text: fallbackText,
      textClean: cleanArabicText(fallbackText),
      characters: fallbackText.split('').map(c => ({ char: c, rules: [], color: '#1e293b' })),
      rules: [],
      tajweedSummary: 'عام تلفظ (Normal)',
      diacritics: countDiacritics(fallbackText)
    };
  }
  return { ...word };
}

// 4. Load QUL 16-line layout
const layoutPath = path.resolve('scripts/qul_16line_layout.json');
const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));

// 5. Build Pages 1 to 559
const pagesMap = {};
for (let p = 1; p <= 559; p++) {
  pagesMap[p] = {
    pageNumber: p,
    isQuranText: p >= 2 && p <= 549,
    lines: []
  };
}

// Page 1: Title page
pagesMap[1].isQuranText = false;
pagesMap[1].lines = [];

// Page 2: Surah Al-Fatiha (illuminated frontispiece)
{
  const p2Path = path.resolve('public/data/pages/page_002.json');
  if (fs.existsSync(p2Path)) {
    const existingP2 = JSON.parse(fs.readFileSync(p2Path, 'utf8'));
    pagesMap[2] = existingP2;
  }
}

// Page 3: Surah Al-Baqarah 1-5 (illuminated frontispiece)
{
  const p3Path = path.resolve('public/data/pages/page_003.json');
  if (fs.existsSync(p3Path)) {
    const existingP3 = JSON.parse(fs.readFileSync(p3Path, 'utf8'));
    pagesMap[3] = existingP3;
  }
}

// Pages 4 to 549: Populate from QUL layout
console.log('Generating Pages 4 to 549 using authentic 16-line layout...');
for (let pageNum = 4; pageNum <= 549; pageNum++) {
  const qulPageNum = pageNum - 1;
  const qulLines = layout[qulPageNum] || [];
  const pageObj = pagesMap[pageNum];
  pageObj.isQuranText = true;
  pageObj.lines = [];

  for (const qLine of qulLines) {
    const lineNum = qLine.lineNumber;

    // Check if header line
    if (qLine.isHeader || (qLine.words.length === 0 && (qLine.isSurahName || qLine.isBismillah))) {
      let surahNum = qLine.surahNumber;
      if (!surahNum) {
        // Find next word's surah
        const nextWordsLine = qulLines.find(l => l.lineNumber > lineNum && l.words.length > 0);
        if (nextWordsLine && nextWordsLine.words[0]) {
          surahNum = nextWordsLine.words[0].surah;
        }
      }
      const surahMeta = SURAHS.find(s => s.number === surahNum) || {
        number: surahNum || 1,
        nameArabic: '',
        totalAyahs: 0,
        revelationType: 'Makki'
      };

      if (qLine.isSurahName || (!qLine.isBismillah && qLine.isHeader)) {
        pageObj.lines.push({
          lineNumber: lineNum,
          isHeader: true,
          headerType: 'surah_title',
          surahNumber: surahMeta.number,
          surahName: surahMeta.nameArabic,
          nameArabic: `سُوْرَةُ ${surahMeta.nameArabic} ${surahMeta.revelationType === 'Makki' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'}`,
          subtitleArabic: `آيَاتُهَا ${surahMeta.totalAyahs.toLocaleString('ar-EG')}`,
          totalAyahs: surahMeta.totalAyahs,
          revelationType: surahMeta.revelationType,
          includeBismillah: qLine.isBismillah,
          words: []
        });
      } else {
        pageObj.lines.push({
          lineNumber: lineNum,
          isHeader: true,
          headerType: 'bismillah',
          words: []
        });
      }
      continue;
    }

    // Normal line with Quran words
    const lineWords = [];
    for (let i = 0; i < qLine.words.length; i++) {
      const qw = qLine.words[i];
      // Accurate marker check: Markers never contain Arabic alphabet letters
      const hasArabicLetters = /[\u0621-\u064A\u0671]/.test(qw.text);
      const isMarker = !hasArabicLetters && (
        qw.text.includes('۟') ||
        /^[\u06DD\uFD3E\uFD3F\uF500-\uF8FF٠-٩\s]+$/.test(qw.text)
      );

      if (isMarker) {
        // Insert Ayah End Marker
        lineWords.push({
          isAyahMarker: true,
          surah: qw.surah,
          ayah: qw.ayah,
          markerText: ` ۝${qw.ayah.toLocaleString('ar-EG')} `
        });
      } else {
        const wordData = getWordData(qw.surah, qw.ayah, qw.position, qw.text);
        wordData.page = pageNum;
        wordData.line = lineNum;
        lineWords.push(wordData);

        // Check if next word in QUL belongs to a new ayah, and current is not followed by marker
        const nextQw = qLine.words[i + 1];
        if (nextQw) {
          const nextHasLetters = /[\u0621-\u064A\u0671]/.test(nextQw.text);
          const nextIsMarker = !nextHasLetters && (
            nextQw.text.includes('۟') ||
            /^[\u06DD\uFD3E\uFD3F\uF500-\uF8FF٠-٩\s]+$/.test(nextQw.text)
          );
          if (!nextIsMarker && (nextQw.ayah !== qw.ayah || nextQw.surah !== qw.surah)) {
            // Ayah boundary between words without explicit marker token
            lineWords.push({
              isAyahMarker: true,
              surah: qw.surah,
              ayah: qw.ayah,
              markerText: ` ۝${qw.ayah.toLocaleString('ar-EG')} `
            });
          }
        }
      }
    }

    pageObj.lines.push({
      lineNumber: lineNum,
      isHeader: false,
      words: lineWords
    });
  }

  // Ensure every page has exactly 16 lines
  while (pageObj.lines.length < 16) {
    pageObj.lines.push({
      lineNumber: pageObj.lines.length + 1,
      isHeader: false,
      words: []
    });
  }
}

// 6. Generate Page Statistics
console.log('Generating statistics across all 559 pages...');
const pageStatistics = {};

for (let p = 1; p <= 559; p++) {
  const pageObj = pagesMap[p];
  let wordCount = 0;
  let letterCount = 0;
  let surahsOnPage = new Set();
  let ayahsOnPage = new Set();
  let tajweedCounts = {
    madd: 0,
    ghunnah: 0,
    qalqalah: 0,
    ikhfa: 0,
    idgham: 0,
    tafkhim: 0,
    normal: 0
  };
  let diacriticsCounts = {
    fatha: 0,
    kasra: 0,
    damma: 0,
    fathatan: 0,
    kasratan: 0,
    dammatan: 0,
    sukoon: 0,
    shaddah: 0,
    maddah: 0,
    standingFatha: 0,
    standingKasra: 0,
    invertedDamma: 0,
    heavyLetters: 0,
    qalqalah: 0
  };

  for (const line of pageObj.lines) {
    for (const w of line.words) {
      if (w.isAyahMarker) continue;
      wordCount++;
      if (w.surah) surahsOnPage.add(w.surah);
      if (w.surah && w.ayah) ayahsOnPage.add(`${w.surah}:${w.ayah}`);

      if (w.characters) {
        letterCount += w.characters.length;
      }

      if (w.rules) {
        if (w.rules.some(r => r.startsWith('madda_'))) tajweedCounts.madd++;
        else if (w.rules.includes('ghunnah')) tajweedCounts.ghunnah++;
        else if (w.rules.includes('qalaqah')) tajweedCounts.qalqalah++;
        else if (w.rules.some(r => r.startsWith('idgham_'))) tajweedCounts.idgham++;
        else if (w.rules.includes('tafkhim')) tajweedCounts.tafkhim++;
        else if (w.rules.includes('ikhafa') || w.rules.includes('ikhafa_shafawi')) tajweedCounts.ikhfa++;
        else tajweedCounts.normal++;
      }

      if (w.diacritics) {
        for (const [k, v] of Object.entries(w.diacritics)) {
          if (diacriticsCounts[k] !== undefined) {
            diacriticsCounts[k] += v;
          }
        }
      }
    }
  }

  pageStatistics[p] = {
    pageNumber: p,
    isQuranText: pageObj.isQuranText,
    totalLines: pageObj.lines.length,
    wordCount,
    letterCount,
    surahCount: surahsOnPage.size,
    ayahCount: ayahsOnPage.size,
    surahs: Array.from(surahsOnPage),
    tajweedCounts,
    diacriticsCounts
  };
}

// 7. Write to public/data/pages/ and dist/data/pages/
console.log('Writing pages JSON to public/data/pages and dist/data/pages...');
const pubDir = path.resolve('public/data/pages');
const distDir = path.resolve('dist/data/pages');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

for (let p = 1; p <= 559; p++) {
  const pStr = String(p).padStart(3, '0');
  const jsonStr = JSON.stringify(pagesMap[p]);
  fs.writeFileSync(path.join(pubDir, `page_${pStr}.json`), jsonStr);
  fs.writeFileSync(path.join(distDir, `page_${pStr}.json`), jsonStr);
}

// Write statistics
const statsJson = JSON.stringify(pageStatistics, null, 2);
fs.writeFileSync(path.resolve('public/data/pageStatistics.json'), statsJson);
fs.writeFileSync(path.resolve('dist/data/pageStatistics.json'), statsJson);
fs.writeFileSync(path.resolve('src/data/pageStatistics.json'), statsJson);

// Write fallback quranPages.json (for first 20 pages or full)
console.log('Writing fallback src/data/quranPages.json...');
fs.writeFileSync(path.resolve('src/data/quranPages.json'), JSON.stringify(pagesMap));

console.log('=== Pipeline Completed Successfully! All 559 Pages Generated! ===');
