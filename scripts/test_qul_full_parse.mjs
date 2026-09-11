process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function parseQulPage(html) {
  const lines = [];
  // Split by <div class="line-container" data-line="(\d+)">
  const lineBlocks = html.split(/<div class="line-container"\s+data-line="(\d+)">/);
  // lineBlocks[0] is header
  for (let i = 1; i < lineBlocks.length; i += 2) {
    const lineNum = parseInt(lineBlocks[i], 10);
    const content = lineBlocks[i + 1] || '';
    
    // Find all words in this line
    const wordRegex = /data-location="([^"]+)"[\s\S]*?<a[^>]*>\s*([\S]+)\s*<\/a>/g;
    let wm;
    const words = [];
    while ((wm = wordRegex.exec(content)) !== null) {
      words.push({ location: wm[1], text: wm[2] });
    }
    
    lines.push({
      lineNumber: lineNum,
      isEmpty: words.length === 0,
      wordCount: words.length,
      start: words[0] ? words[0].location : null,
      end: words[words.length - 1] ? words[words.length - 1].location : null
    });
  }
  return lines;
}

async function run() {
  for (const p of [1, 2, 3, 4, 19, 20]) {
    const res = await fetch(`https://qul.tarteel.ai/resources/mushaf-layout/11?page=${p}`);
    const html = await res.text();
    const lines = parseQulPage(html);
    console.log(`=== QUL Page ${p} (App Page ${p+1}) === Total lines: ${lines.length}`);
    const validLines = lines.filter(l => !l.isEmpty);
    console.log(`Text lines: ${validLines.length}. First: ${validLines[0]?.start} -> Last: ${validLines[validLines.length - 1]?.end}`);
  }
}
run();
