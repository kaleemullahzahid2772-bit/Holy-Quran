process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  for (let p = 1; p <= 6; p++) {
    const res = await fetch('https://api.quran.com/api/v4/verses/by_page/' + p + '?mushaf=15');
    const data = await res.json();
    const verses = (data.verses || []).map(v => v.verse_key);
    console.log('Mushaf 15 Page', p, ':', verses[0], 'to', verses[verses.length - 1], 'Count:', verses.length);
  }
}
run();
