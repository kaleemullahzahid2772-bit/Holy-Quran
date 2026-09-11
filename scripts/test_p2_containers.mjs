process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const res = await fetch(`https://qul.tarteel.ai/resources/mushaf-layout/11?page=2`);
  const html = await res.text();
  const lineContainers = html.match(/<div class="line-container"[^>]*>[\s\S]*?(?=<div class="line-container"|<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/g) || [];
  console.log('Page 2 line containers:', lineContainers.length);
  for (let i = 0; i < Math.min(lineContainers.length, 5); i++) {
    console.log(`Line ${i+1} snippet:`, lineContainers[i].slice(0, 150).replace(/\s+/g, ' '));
  }
}
run();
