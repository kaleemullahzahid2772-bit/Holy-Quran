process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const res = await fetch(`https://qul.tarteel.ai/resources/mushaf-layout/11?page=3`);
  const html = await res.text();
  const idx = html.indexOf('data-location="2:5:1"');
  if (idx !== -1) {
    console.log(html.slice(idx - 400, idx));
  }
}
run();
