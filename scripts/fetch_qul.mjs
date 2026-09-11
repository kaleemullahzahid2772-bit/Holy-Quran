import fs from 'fs';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const res = await fetch('https://qul.tarteel.ai/resources/mushaf-layout/11');
  const html = await res.text();
  const lines = html.split('\n');
  console.log(lines.slice(248, 270).join('\n'));
}
run();
