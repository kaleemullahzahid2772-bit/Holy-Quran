process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const res = await fetch(`https://qul.tarteel.ai/resources/mushaf-layout/11?page=2`);
  const html = await res.text();
  const idx1 = html.indexOf('id="line-1"');
  const idx2 = html.indexOf('id="line-2"');
  const idx3 = html.indexOf('id="line-3"');
  console.log('Line 1 inside:', html.slice(idx1, idx2));
  console.log('Line 2 inside:', html.slice(idx2, idx3));
}
run();
