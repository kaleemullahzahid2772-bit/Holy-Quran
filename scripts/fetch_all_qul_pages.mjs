import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const outputFile = path.resolve('scripts/qul_16line_layout.json');

// If already partially downloaded, support resuming
let allPages = {};
if (fs.existsSync(outputFile)) {
  try {
    allPages = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`Loaded ${Object.keys(allPages).length} existing pages from cache.`);
  } catch (e) {
    allPages = {};
  }
}

function parseQulPage(html, pageNum) {
  const lines = [];
  const lineBlocks = html.split(/<div class="line-container"\s+data-line="(\d+)">/);
  
  for (let i = 1; i < lineBlocks.length; i += 2) {
    const lineNum = parseInt(lineBlocks[i], 10);
    const content = lineBlocks[i + 1] || '';
    
    // Check if header line
    const isSurahName = content.includes('line--surah-name');
    const isBismillah = content.includes('line--bismillah') || content.includes('class="bismillah"');
    
    let surahNum = null;
    const sMatch = content.match(/surah(\d{3})/);
    if (sMatch) {
      surahNum = parseInt(sMatch[1], 10);
    }
    
    // Extract words
    const wordRegex = /data-location="([^"]+)"[\s\S]*?<a[^>]*>\s*([\S]+)\s*<\/a>/g;
    let wm;
    const words = [];
    while ((wm = wordRegex.exec(content)) !== null) {
      const loc = wm[1]; // e.g. "2:5:1"
      const [s, a, w] = loc.split(':').map(n => parseInt(n, 10));
      words.push({
        location: loc,
        surah: s,
        ayah: a,
        position: w,
        text: wm[2]
      });
    }
    
    lines.push({
      lineNumber: lineNum,
      isHeader: isSurahName || (isBismillah && words.length === 0),
      isSurahName,
      isBismillah,
      surahNumber: surahNum,
      words
    });
  }
  
  return lines;
}

async function fetchPage(p) {
  const res = await fetch(`https://qul.tarteel.ai/resources/mushaf-layout/11?page=${p}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for page ${p}`);
  const html = await res.text();
  return parseQulPage(html, p);
}

async function main() {
  console.log('Fetching 16-line layout from QUL for pages 1 to 548...');
  const BATCH_SIZE = 15;
  
  for (let start = 1; start <= 548; start += BATCH_SIZE) {
    const end = Math.min(548, start + BATCH_SIZE - 1);
    const pagesToFetch = [];
    for (let p = start; p <= end; p++) {
      if (!allPages[p]) {
        pagesToFetch.push(p);
      }
    }
    
    if (pagesToFetch.length > 0) {
      const results = await Promise.all(
        pagesToFetch.map(async (p) => {
          try {
            const lines = await fetchPage(p);
            return { page: p, lines, success: true };
          } catch (err) {
            console.error(`Error on page ${p}:`, err.message);
            return { page: p, lines: [], success: false };
          }
        })
      );
      
      for (const r of results) {
        if (r.success) {
          allPages[r.page] = r.lines;
        }
      }
      
      console.log(`Progress: Pages ${start} to ${end} done. Total cached: ${Object.keys(allPages).length}/548`);
      fs.writeFileSync(outputFile, JSON.stringify(allPages));
    }
  }
  
  console.log('Finished downloading all 548 pages!');
}

main().catch(console.error);
