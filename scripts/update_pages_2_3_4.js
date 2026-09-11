import fs from 'fs';
import path from 'path';

console.log('=== Updating Page 2, Page 3, and Page 4 datasets ===');

// Load index data for tajweed legend
const indexPath = path.resolve('node_modules/react-native-quran-tajweed/src/data/index.json');
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const LEGEND = indexData.legend;
const decodeRules = (codes) => codes.map(c => LEGEND[c]).filter(Boolean);

// Helper to count diacritics
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

  return { letters, fatha, kasra, damma, fathatan, kasratan, dammatan, sukoon, shaddah, maddah, standingFatha, standingKasra, invertedDamma, heavyLetters, qalqalah };
}

function resolveTajweedColor(rules) {
  if (!rules || rules.length === 0) return '#1e293b';
  if (rules.some(r => r.startsWith('madda_'))) return '#e11d48';
  if (rules.includes('ghunnah')) return '#e11d48';
  if (rules.includes('qalaqah')) return '#0284c7';
  if (rules.some(r => r.startsWith('idgham_'))) return '#ea580c';
  if (rules.includes('tafkhim') || rules.includes('ikhafa') || rules.includes('ikhafa_shafawi')) return '#16a34a';
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

// Function to extract words from surah JSON
function extractSurahWords(surahNum, surahNameArabic, startWordId = 1) {
  const sStr = String(surahNum).padStart(3, '0');
  const filePath = path.resolve(`node_modules/react-native-quran-tajweed/src/data/surah_${sStr}.json`);
  const surahJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const words = [];
  let wId = startWordId;

  for (const aObj of surahJson.ayahs) {
    const ayahNum = aObj.ayah;
    let wordPosInAyah = 1;

    let currentWordChars = [];
    let currentWordRules = new Set();

    for (const [segText, segRules] of aObj.s) {
      const decodedRules = decodeRules(segRules);
      const charColor = resolveTajweedColor(decodedRules);

      for (let i = 0; i < segText.length; i++) {
        const char = segText[i];
        if (char === ' ') {
          if (currentWordChars.length > 0) {
            const wordFullText = currentWordChars.map(c => c.char).join('');
            const wordClean = cleanArabicText(wordFullText);
            const rulesArr = Array.from(currentWordRules);

            words.push({
              id: wId++,
              surah: surahNum,
              surahName: surahNameArabic,
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

      words.push({
        id: wId++,
        surah: surahNum,
        surahName: surahNameArabic,
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

    // Add Ayah marker
    words.push({
      isAyahMarker: true,
      surah: surahNum,
      ayah: ayahNum,
      markerText: ` ۝${ayahNum.toLocaleString('ar-EG')} `
    });
  }

  return { words, nextWordId: wId };
}

// 1. EXTRACT SURAH 1 WORDS
const { words: s1Words, nextWordId: idAfterS1 } = extractSurahWords(1, 'الفَاتِحَة', 1);
console.log('Surah 1 total items (words + markers):', s1Words.length);

// 2. BUILD PAGE 2 DATA (Surah Al-Fatiha in 6 lines)
// Surah 1 has:
// words 0..3: Bismillah
// marker 1: word 4
// word 5..8: Alhamdulillah
// marker 2: word 9
// word 10..11: Ar-Rahman Ar-Rahim
// marker 3: word 12
// word 13..15: Maliki yawmi-d-din
// marker 4: word 16
// word 17..20: Iyyaka na'budu wa iyyaka nasta'in
// marker 5: word 21
// word 22..24: Ihdina-s-sirata-l-mustaqim
// marker 6: word 25
// word 26: sirata
// word 27..29: alladhina an'amta alayhim
// word 30: ghayri
// word 31..34: al-maghdubi alayhim wa la-d-dallin
// marker 7: word 35

const bismillahWords = s1Words.slice(0, 4);

// 6 lines exactly matching reference page 2:
const p2Line1 = [s1Words[5], s1Words[6], s1Words[7], s1Words[8], s1Words[4], s1Words[10]]; // الْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِينَ ۝١ الرَّحْمٰنِ
const p2Line2 = [s1Words[11], s1Words[9], s1Words[13], s1Words[14], s1Words[15], s1Words[12]]; // الرَّحِيْمِ ۝٢ مٰلِكِ يَوْمِ الدِّيْنِ ؕ ۝٣
const p2Line3 = [s1Words[17], s1Words[18], s1Words[19], s1Words[20], s1Words[16]]; // اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَعِيْنُ ؕ ۝٤
const p2Line4 = [s1Words[22], s1Words[23], s1Words[24], s1Words[21], s1Words[26]]; // اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَ ۙ ۝٥ صِرَاطَ
const p2Line5 = [s1Words[27], s1Words[28], s1Words[29], s1Words[25], s1Words[30]]; // الَّذِيْنَ اَنْعَمْتَ عَلَيْهِمْ ەۙ ۝٦ غَيْرِ
const p2Line6 = [s1Words[31], s1Words[32], s1Words[33], s1Words[34], s1Words[35]]; // الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّآلِّيْنَ ٪ ۝٧

const page2Data = {
  pageNumber: 2,
  isQuranText: true,
  isIlluminated: true,
  lines: [
    {
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
    },
    {
      lineNumber: 2,
      isHeader: true,
      headerType: 'bismillah',
      words: bismillahWords
    },
    { lineNumber: 3, isHeader: false, words: p2Line1 },
    { lineNumber: 4, isHeader: false, words: p2Line2 },
    { lineNumber: 5, isHeader: false, words: p2Line3 },
    { lineNumber: 6, isHeader: false, words: p2Line4 },
    { lineNumber: 7, isHeader: false, words: p2Line5 },
    { lineNumber: 8, isHeader: false, words: p2Line6 }
  ]
};

// Set page and line numbers for all words in p2
page2Data.lines.forEach((l) => {
  l.words.forEach((w) => {
    if (!w.isAyahMarker) {
      w.page = 2;
      w.line = l.lineNumber;
    }
  });
});

// 3. EXTRACT SURAH 2 WORDS
const { words: s2Words } = extractSurahWords(2, 'البَقَرَة', idAfterS1);
console.log('Surah 2 total items:', s2Words.length);

// Page 3: ONLY Ayahs 1 to 5 (items 0 to 31) in 6 lines
const p3Line1 = [s2Words[0], s2Words[1], s2Words[2], s2Words[3], s2Words[4], s2Words[5], s2Words[6]]; // الٓمٓ ۚ ۝١ ذٰلِكَ الْكِتٰبُ لَا رَيْبَ ۛ فِيْهِ ۛ
const p3Line2 = [s2Words[7], s2Words[8], s2Words[9], s2Words[10], s2Words[11]]; // هُدًى لِّلْمُتَّقِيْنَ ۙ ۝٢ الَّذِيْنَ يُؤْمِنُوْنَ
const p3Line3 = [s2Words[12], s2Words[13], s2Words[14], s2Words[15]]; // بِالْغَيْبِ وَيُقِيْمُوْنَ الصَّلٰوةَ وَمِمَّا
const p3Line4 = [s2Words[16], s2Words[17], s2Words[18], s2Words[19]]; // رَزَقْنٰهُمْ يُنْفِقُوْنَ ۙ ۝٣ وَ الَّذِيْنَ
const p3Line5 = [s2Words[20], s2Words[21], s2Words[22], s2Words[23], s2Words[24], s2Words[25]]; // يُؤْمِنُوْنَ بِمَآ اُنْزِلَ اِلَيْكَ وَمَآ اُنْزِلَ
const p3Line6 = [s2Words[26], s2Words[27], s2Words[28], s2Words[29], s2Words[30], s2Words[31]]; // مِنْ قَبْلِكَ ۚ وَبِالْاٰخِرَةِ هُمْ يُوْقِنُوْنَ ؕ ۝٤

const page3Data = {
  pageNumber: 3,
  isQuranText: true,
  isIlluminated: true,
  lines: [
    {
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
    },
    {
      lineNumber: 2,
      isHeader: true,
      headerType: 'bismillah',
      words: []
    },
    { lineNumber: 3, isHeader: false, words: p3Line1 },
    { lineNumber: 4, isHeader: false, words: p3Line2 },
    { lineNumber: 5, isHeader: false, words: p3Line3 },
    { lineNumber: 6, isHeader: false, words: p3Line4 },
    { lineNumber: 7, isHeader: false, words: p3Line5 },
    { lineNumber: 8, isHeader: false, words: p3Line6 }
  ]
};

page3Data.lines.forEach((l) => {
  l.words.forEach((w) => {
    if (!w.isAyahMarker) {
      w.page = 3;
      w.line = l.lineNumber;
    }
  });
});

// 4. SAVE TO public/data/pages/ AND dist/data/pages/
const p2Path = path.resolve('public/data/pages/page_002.json');
const p3Path = path.resolve('public/data/pages/page_003.json');
fs.writeFileSync(p2Path, JSON.stringify(page2Data));
fs.writeFileSync(p3Path, JSON.stringify(page3Data));

const distP2 = path.resolve('dist/data/pages/page_002.json');
const distP3 = path.resolve('dist/data/pages/page_003.json');
if (fs.existsSync(path.dirname(distP2))) {
  fs.writeFileSync(distP2, JSON.stringify(page2Data));
  fs.writeFileSync(distP3, JSON.stringify(page3Data));
}

console.log('Successfully updated page_002.json and page_003.json!');
