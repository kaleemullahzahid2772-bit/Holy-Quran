process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const url = 'https://api.quran.com/api/v4/verses/by_page/3?mushaf=7&words=true&word_fields=text_indopak,line_number';
  const res = await fetch(url);
  const data = await res.json();
  const lines = {};
  for (const v of data.verses) {
    for (const w of v.words) {
      if (!lines[w.line_number]) lines[w.line_number] = [];
      lines[w.line_number].push(w.text_indopak || w.text);
    }
  }
  for (let l = 1; l <= 16; l++) {
    if (lines[l]) console.log(`Line ${l}: ${lines[l].join(' ')}`);
  }
}
run();
