process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const res = await fetch('https://qul.tarteel.ai/resources/mushaf-layout/11?page=3');
  const html = await res.text();
  const words = html.match(/\/cms\/mushaf_words\/\d+/g);
  console.log('Words count:', words ? words.length : 0);
  // find preview container
  const idx = html.indexOf('mushaf_words');
  if (idx !== -1) {
    console.log('Snippet around mushaf_words:');
    console.log(html.slice(idx - 100, idx + 400));
  }
}
run();
