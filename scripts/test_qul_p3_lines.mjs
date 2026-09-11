process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const res = await fetch('https://qul.tarteel.ai/resources/mushaf-layout/11?page=3');
  const html = await res.text();
  const re = /data-line="(\d+)"[\s\S]*?data-location="([^"]+)"[\s\S]*?<a[^>]*>\s*([\S]+)\s*<\/a>/g;
  let m;
  const lines = {};
  while ((m = re.exec(html)) !== null) {
    const lineNum = m[1];
    const loc = m[2];
    const word = m[3];
    if (!lines[lineNum]) lines[lineNum] = [];
    lines[lineNum].push({ loc, word });
  }
  for (const [lNum, wList] of Object.entries(lines)) {
    console.log(`Line ${lNum}: ${wList[0].loc} (${wList[0].word}) -> ${wList[wList.length - 1].loc} (${wList[wList.length - 1].word}) [${wList.length} words]`);
  }
}
run();
