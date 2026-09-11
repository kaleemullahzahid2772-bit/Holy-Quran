process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function parseQulPage(html) {
  // Regex to match each word span
  // e.g. <span class="char ... " id="word-..." data-word-id="..." data-location="2:5:1" data-ayah="2:5" data-line="1" ...>
  // <a ...> اُولٰٓىِٕكَ </a>
  const wordRegex = /<span\s+class="char[^"]*"\s+id="[^"]*"\s+data-word-id="(\d+)"\s+data-location="([^"]+)"\s+data-ayah="([^"]+)"\s+data-line="(\d+)"[\s\S]*?<a[^>]*>\s*([^<]+?)\s*<\/a>/g;
  let match;
  const lines = {};
  while ((match = wordRegex.exec(html)) !== null) {
    const wordId = parseInt(match[1], 10);
    const location = match[2];
    const ayah = match[3];
    const lineNum = parseInt(match[4], 10);
    const text = match[5].trim();
    if (!lines[lineNum]) lines[lineNum] = [];
    lines[lineNum].push({ wordId, location, ayah, text });
  }
  return lines;
}

async function run() {
  for (const p of [1, 2, 3, 4, 5]) {
    const res = await fetch(`https://qul.tarteel.ai/resources/mushaf-layout/11?page=${p}`);
    const html = await res.text();
    const lines = parseQulPage(html);
    const lineKeys = Object.keys(lines);
    console.log(`Page ${p} has ${lineKeys.length} lines:`);
    for (const l of lineKeys) {
      const words = lines[l];
      const startW = words[0];
      const endW = words[words.length - 1];
      console.log(`  L${l}: ${words.length} words [${startW.location} (${startW.text}) -> ${endW.location} (${endW.text})]`);
    }
  }
}
run();
