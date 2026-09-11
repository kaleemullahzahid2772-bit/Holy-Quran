import fs from 'fs';
import path from 'path';

const layout = JSON.parse(fs.readFileSync('scripts/qul_16line_layout.json', 'utf8'));
const p3Lines = layout[3];

for (const l of p3Lines) {
  const lineWords = [];
  for (let i = 0; i < l.words.length; i++) {
    const w = l.words[i];
    const isMarker = /[\u06DD\uFD3E\uFD3F\uF500-\uF8FF]/.test(w.text) || w.text.includes('۟') || /^[٠-٩]+$/.test(w.text);
    if (isMarker) {
      const ayahNum = w.ayah;
      lineWords.push(`[۝${ayahNum}]`);
    } else {
      lineWords.push(w.text);
    }
  }
  console.log(`L${l.lineNumber}: ${lineWords.join(' ')}`);
}
