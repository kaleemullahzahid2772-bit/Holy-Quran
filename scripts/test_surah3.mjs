process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  for (let p of [44, 45, 46]) {
    const res = await fetch(`https://qul.tarteel.ai/resources/mushaf-layout/11?page=${p}`);
    const html = await res.text();
    if (html.includes('3:1:1') || html.includes('data-ayah="3:1"')) {
      console.log(`Surah 3 starts on QUL Page ${p} (App Page ${p+1})!`);
      const lineBlocks = html.split(/<div class="line-container"\s+data-line="(\d+)">/);
      for (let i = 1; i < lineBlocks.length; i += 2) {
        const lNum = lineBlocks[i];
        const content = lineBlocks[i+1];
        if (!content.includes('data-location')) {
          console.log(`Line ${lNum} has NO word data! Snippet:`, content.slice(0, 150).replace(/\s+/g, ' '));
        } else if (content.includes('3:1:1')) {
          console.log(`Line ${lNum} has 3:1:1!`);
        }
      }
    }
  }
}
run();
