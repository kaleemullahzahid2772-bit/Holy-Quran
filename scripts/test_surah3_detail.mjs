process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const res = await fetch(`https://qul.tarteel.ai/resources/mushaf-layout/11?page=45`);
  const html = await res.text();
  const lineBlocks = html.split(/<div class="line-container"\s+data-line="(\d+)">/);
  for (let i = 1; i < lineBlocks.length; i += 2) {
    const lNum = lineBlocks[i];
    const content = lineBlocks[i+1];
    if (lNum === "4") {
      console.log(`Line 4 full content:`);
      console.log(content.slice(0, 500));
    }
  }
}
run();
