const fs = require('fs');
const path = require('path');

const pdfPath = path.resolve(__dirname, '..', 'quran.pdf');
const outDir = path.resolve(__dirname, '..', 'public', 'pages');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Reading Quran.pdf from:', pdfPath);
const bufStr = fs.readFileSync(pdfPath, 'latin1');
const buffer = fs.readFileSync(pdfPath);

const imgObjRegex = /<<[^>]*?\/Subtype\s*\/Image[^>]*?>>stream\r?\n/g;
let match;
let count = 0;

console.log('Extracting page images directly from PDF stream...');

while ((match = imgObjRegex.exec(bufStr)) !== null) {
  count++;
  const dict = match[0];
  const streamStart = match.index + match[0].length;
  const lMatch = dict.match(/\/Length\s+(\d+)/);
  if (!lMatch) continue;
  
  const length = parseInt(lMatch[1], 10);
  const imgBuf = buffer.subarray(streamStart, streamStart + length);
  
  const pageNumStr = String(count).padStart(3, '0');
  const outPath = path.join(outDir, `page_${pageNumStr}.jpg`);
  
  fs.writeFileSync(outPath, imgBuf);
  
  if (count % 100 === 0 || count === 1 || count === 559) {
    console.log(`Extracted page ${count} / 559 -> ${path.basename(outPath)} (${(imgBuf.length / 1024).toFixed(1)} KB)`);
  }
}

console.log(`Successfully extracted all ${count} pages into public/pages/!`);
