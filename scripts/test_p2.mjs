process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const url = 'https://api.quran.com/api/v4/verses/by_page/2?mushaf=7&words=true&word_fields=text_indopak,line_number';
  const res = await fetch(url);
  const data = await res.json();
  for (const v of data.verses) {
    console.log(`Verse ${v.verse_key}: lines [${[...new Set(v.words.map(w => w.line_number))].join(', ')}]`);
  }
}
run();
