import fs from 'fs';
import path from 'path';

console.log('=== Running Quran Build Validation Script ===');

const pagesPath = path.resolve('src/data/quranPages.json');
const statsPath = path.resolve('src/data/pageStatistics.json');
const occPath = path.resolve('src/data/wordOccurrences.json');

const pagesMap = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
const pageStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
const occMap = JSON.parse(fs.readFileSync(occPath, 'utf8'));

let errors = [];
let warnings = [];

// 1. Check page sequence 1 to 559
for (let p = 1; p <= 559; p++) {
  if (!pagesMap[p]) {
    errors.push(`Missing page ${p} in quranPages.json`);
  }
  if (!pageStats[p]) {
    errors.push(`Missing page ${p} in pageStatistics.json`);
  }
}

// 2. Check 16 lines on Quran text pages (2 to 549)
for (let p = 2; p <= 549; p++) {
  const pObj = pagesMap[p];
  if (!pObj || !pObj.lines || pObj.lines.length !== 16) {
    errors.push(`Page ${p} does not have exactly 16 lines! Found: ${pObj?.lines?.length}`);
  }
}

// 3. Check page statistics validity
for (let p = 2; p <= 549; p++) {
  const st = pageStats[p];
  if (!st || !st.isCalculated) {
    errors.push(`Page ${p} statistics not calculated!`);
  }
  if (st.totalWords <= 0) {
    warnings.push(`Page ${p} has 0 words in statistics.`);
  }
  if (st.totalLetters <= 0) {
    warnings.push(`Page ${p} has 0 letters in statistics.`);
  }
}

// 4. Check occurrences index
const sampleWords = ['الله', 'الرحمن', 'عظيم', 'عليم'];
for (const sw of sampleWords) {
  if (!occMap[sw] || occMap[sw].totalCount <= 0) {
    errors.push(`Expected occurrence for "${sw}" missing or 0.`);
  } else {
    console.log(`✓ Validated occurrence "${sw}": ${occMap[sw].totalCount} occurrences found.`);
  }
}

console.log(`Total Pages Validated: ${Object.keys(pagesMap).length}`);
console.log(`Total Statistics Pages: ${Object.keys(pageStats).length}`);
console.log(`Total Unique Words in Occurrence Index: ${Object.keys(occMap).length}`);

if (errors.length > 0) {
  console.error('❌ Validation FAILED with errors:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log('✅ ALL QURAN BUILD VALIDATION CHECKS PASSED PERFECTLY!');
  if (warnings.length > 0) {
    console.log(`(Warnings: ${warnings.length})`);
  }
}
