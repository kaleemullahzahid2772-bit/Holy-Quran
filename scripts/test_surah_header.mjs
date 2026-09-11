process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const res = await fetch(`https://qul.tarteel.ai/resources/mushaf-layout/11?page=44`);
  const html = await res.text();
  const surahHeaderMatches = html.match(/class="[^"]*(?:surah|header|bismillah|title)[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || [];
  console.log('Header matches:', surahHeaderMatches.slice(0, 5));
  // check lines with no words
  const lineBlocks = html.split(/<div class="line-container"\s+data-line="(\d+)">/);
  for (let i = 1; i < lineBlocks.length; i += 2) {
    const lNum = lineBlocks[i];
    const content = lineBlocks[i+1];
    if (!content.includes('data-location')) {
      console.log(`Line ${lNum} has NO word data! Snippet:`, content.slice(0, 150).replace(/\s+/g, ' '));
    }
  }
}
run();
