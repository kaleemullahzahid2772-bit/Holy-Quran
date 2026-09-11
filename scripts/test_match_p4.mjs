import fs from 'fs';
const layout = JSON.parse(fs.readFileSync('scripts/qul_16line_layout.json', 'utf8'));
const p4Lines = layout[4];
console.log('QUL Page 4 total lines:', p4Lines.length);
for (const l of p4Lines) {
  const w0 = l.words[0];
  const wN = l.words[l.words.length - 1];
  console.log(`L${l.lineNumber}: ${l.words.length} words | ${w0?.location} (${w0?.text}) ... ${wN?.location} (${wN?.text})`);
}
