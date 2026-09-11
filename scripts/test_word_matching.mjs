import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('node_modules/react-native-quran-tajweed/src/data/index.json');
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const LEGEND = indexData.legend;
const decodeRules = (codes) => codes.map(c => LEGEND[c]).filter(Boolean);

function resolveTajweedColor(rules) {
  if (!rules || rules.length === 0) return '#1e293b';
  if (rules.some(r => r.startsWith('madda_'))) return '#e11d48';
  if (rules.includes('ghunnah')) return '#e11d48';
  if (rules.includes('qalaqah')) return '#0284c7';
  if (rules.some(r => r.startsWith('idgham_'))) return '#ea580c';
  if (rules.includes('tafkhim') || rules.includes('ikhafa') || rules.includes('ikhafa_shafawi')) return '#16a34a';
  return '#1e293b';
}

function cleanArabicText(text) {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u06DF-\u06E4\u0640\u200C\u200D\u200E\u200F\uFEFF]/g, '')
    .replace(/[ٱإأآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

// Load Surah 2 words
const s2Path = path.resolve('node_modules/react-native-quran-tajweed/src/data/surah_002.json');
const s2Json = JSON.parse(fs.readFileSync(s2Path, 'utf8'));
const wordsMap = new Map();

for (const aObj of s2Json.ayahs) {
  const ayahNum = aObj.ayah;
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
          wordsMap.set(`2:${ayahNum}:${wordPos}`, {
            surah: 2,
            ayah: ayahNum,
            position: wordPos,
            text: wText,
            characters: curChars,
            rules: Array.from(curRules)
          });
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
    wordsMap.set(`2:${ayahNum}:${wordPos}`, {
      surah: 2,
      ayah: ayahNum,
      position: wordPos,
      text: wText,
      characters: curChars,
      rules: Array.from(curRules)
    });
  }
}

console.log('Surah 2 words loaded:', wordsMap.size);

// Check matching for QUL Page 3 (our Page 4)
const layout = JSON.parse(fs.readFileSync('scripts/qul_16line_layout.json', 'utf8'));
const p3Lines = layout[3];
let matched = 0, missing = 0;
for (const l of p3Lines) {
  for (const w of l.words) {
    if (wordsMap.has(w.location)) {
      matched++;
    } else {
      // Check if it is an ayah end marker in QUL
      if (/[\u06DD\uFD3E\uFD3F\uF500-\uF8FF]/.test(w.text) || w.text.includes('۟')) {
        // Marker
      } else {
        missing++;
        console.log('Missing word:', w.location, w.text);
      }
    }
  }
}
console.log(`Page 4 matching: ${matched} matched, ${missing} missing`);
