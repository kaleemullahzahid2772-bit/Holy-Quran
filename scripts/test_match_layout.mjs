import fs from 'fs';
import path from 'path';

const layout = JSON.parse(fs.readFileSync('scripts/qul_16line_layout.json', 'utf8'));

// Test on Page 3 of QUL (our App Page 4)
const p3Lines = layout[3];
console.log('QUL Page 3 total lines:', p3Lines.length);
for (const l of p3Lines) {
  const w0 = l.words[0];
  const wN = l.words[l.words.length - 1];
  console.log(`L${l.lineNumber}: ${l.words.length} words | ${w0?.location} (${w0?.text}) ... ${wN?.location} (${wN?.text})`);
}
