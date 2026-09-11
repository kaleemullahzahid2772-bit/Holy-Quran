process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const res = await fetch('https://qul.tarteel.ai/resources/mushaf-layout/11?page=3');
  const html = await res.text();
  const apiMatches = html.match(/\/api\/[^"'\s]+/g) || [];
  console.log('API matches:', [...new Set(apiMatches)]);
  const jsonMatches = html.match(/https?:\/\/[^"'\s]+\.json/g) || [];
  console.log('JSON matches:', [...new Set(jsonMatches)]);
}
run();
