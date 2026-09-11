process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function run() {
  const url = 'https://api.quran.com/api/v4/verses/by_page/3?mushaf=7&words=true&word_fields=text_indopak,line_number';
  const res = await fetch(url);
  const data = await res.json();
  console.log('Verses count:', data.verses?.length);
  if (data.verses && data.verses.length > 0) {
    const v = data.verses[0];
    console.log('First verse:', v.verse_key);
    console.log('Sample words:', v.words?.slice(0, 3));
  }
}
run();
