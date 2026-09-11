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

console.log('Loading all 114 surahs into word dictionary...');
const allWordsMap = new Map();

for (let sNum = 1; sNum <= 114; sNum++) {
  const sStr = String(sNum).padStart(3, '0');
  const filePath = path.resolve(`node_modules/react-native-quran-tajweed/src/data/surah_${sStr}.json`);
  if (!fs.existsSync(filePath)) continue;
  const sJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
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
            allWordsMap.set(`${sNum}:${aNum}:${wordPos}`, {
              surah: sNum,
              ayah: aNum,
              position: wordPos,
              text: wText,
              textClean: cleanArabicText(wText),
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
      allWordsMap.set(`${sNum}:${aNum}:${wordPos}`, {
        surah: sNum,
        ayah: aNum,
        position: wordPos,
        text: wText,
        textClean: cleanArabicText(wText),
        characters: curChars,
        rules: Array.from(curRules)
      });
    }
  }
}
console.log(`Total words loaded in dictionary: ${allWordsMap.size}`);

const layout = JSON.parse(fs.readFileSync('scripts/qul_16line_layout.json', 'utf8'));
let totalQulWords = 0;
let exactMatches = 0;
let markerMatches = 0;
let unMatched = [];

for (let p = 1; p <= 548; p++) {
  const lines = layout[p] || [];
  for (const l of lines) {
    for (const w of l.words) {
      totalQulWords++;
      const isMarker = /[\u06DD\uFD3E\uFD3F\uF500-\uF8FF]/.test(w.text) || w.text.includes('۟') || /^[٠-٩]+$/.test(w.text);
      if (isMarker) {
        markerMatches++;
      } else if (allWordsMap.has(w.location)) {
        exactMatches++;
      } else {
        unMatched.push({ page: p, line: l.lineNumber, ...w });
      }
    }
  }
}

console.log(`Summary across all 548 pages:`);
console.log(`Total QUL items: ${totalQulWords}`);
console.log(`Exact word matches: ${exactMatches}`);
console.log(`Marker matches: ${markerMatches}`);
console.log(`Unmatched words: ${unMatched.length}`);
if (unMatched.length > 0) {
  console.log('Sample unmatched:', unMatched.slice(0, 10));
}
