import fs from 'fs';
import path from 'path';

console.log('=== Building 604-Page Madani Thematic Dataset with Tajweed ===');

// 1. Load Surahs metadata
const surahsDataPath = path.resolve('src/data/surahsData.ts');
const surahsFile = fs.readFileSync(surahsDataPath, 'utf8');
const SURAHS = [];
const surahBlockMatch = surahsFile.match(/export const SURAHS_DATA: Surah\[\] = \[([\s\S]*?)\];/);
if (surahBlockMatch) {
  const content = surahBlockMatch[1];
  const items = content.split(/\n\s*\{\s*number:/).filter(Boolean);
  for (const item of items) {
    const raw = item.startsWith('{') ? item : '{ number:' + item;
    const numMatch = raw.match(/number:\s*(\d+)/);
    const arMatch = raw.match(/nameArabic:\s*'([^']+)'/);
    const enMatch = raw.match(/nameEnglish:\s*'([^']+)'/);
    const urMatch = raw.match(/nameUrdu:\s*'([^']+)'/);
    const revMatch = raw.match(/revelationType:\s*'([^']+)'/);
    const ayahsMatch = raw.match(/totalAyahs:\s*(\d+)/);
    const startPMatch = raw.match(/startPage:\s*(\d+)/);
    const endPMatch = raw.match(/endPage:\s*(\d+)/);

    if (numMatch && arMatch) {
      SURAHS.push({
        number: parseInt(numMatch[1], 10),
        nameArabic: arMatch[1],
        nameEnglish: enMatch ? enMatch[1] : '',
        nameUrdu: urMatch ? urMatch[1] : '',
        revelationType: revMatch ? revMatch[1] : 'Makki',
        totalAyahs: ayahsMatch ? parseInt(ayahsMatch[1], 10) : 0,
        startPage: startPMatch ? parseInt(startPMatch[1], 10) : 1,
        endPage: endPMatch ? parseInt(endPMatch[1], 10) : 1
      });
    }
  }
}
console.log(`Loaded ${SURAHS.length} Surahs metadata.`);

// 2. Load Tajweed Legend & Rules Decoder
const indexPath = path.resolve('node_modules/react-native-quran-tajweed/src/data/index.json');
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const LEGEND = indexData.legend;
const decodeRules = (codes) => codes.map(c => LEGEND[c]).filter(Boolean);

function resolveTajweedColor(rules) {
  if (!rules || rules.length === 0) return '#1e293b';
  if (rules.some(r => r.startsWith('madda_'))) return '#e11d48'; // Red/Pink
  if (rules.includes('ghunnah')) return '#e11d48'; // Pink/Red
  if (rules.includes('qalaqah')) return '#0284c7'; // Blue/Cyan
  if (rules.some(r => r.startsWith('idgham_'))) return '#ea580c'; // Orange
  if (rules.includes('tafkhim') || rules.includes('ikhafa') || rules.includes('ikhafa_shafawi')) return '#16a34a'; // Green
  return '#1e293b';
}

function getTajweedLabel(rules) {
  if (!rules || rules.length === 0) return 'عام تلفظ (Normal)';
  const labels = [];
  if (rules.some(r => r.startsWith('madda_'))) labels.push('مد (Madd)');
  if (rules.includes('ghunnah')) labels.push('غنہ (Ghunnah)');
  if (rules.includes('qalaqah')) labels.push('قلقلہ (Qalqalah)');
  if (rules.some(r => r.startsWith('idgham_'))) labels.push('ادغام (Idgham)');
  if (rules.includes('tafkhim')) labels.push('تفخیم / پر (Heavy Letter)');
  if (rules.includes('ikhafa') || rules.includes('ikhafa_shafawi')) labels.push('اخفاء (Ikhfa)');
  return labels.join(' + ') || 'تجوید';
}

function cleanArabicText(text) {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u06DF-\u06E4\u0640\u200C\u200D\u200E\u200F\uFEFF]/g, '')
    .replace(/[ٱإأآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

function countDiacritics(text) {
  let fatha = 0, kasra = 0, damma = 0;
  let fathatan = 0, kasratan = 0, dammatan = 0;
  let sukoon = 0, shaddah = 0, maddah = 0;
  let standingFatha = 0, standingKasra = 0, invertedDamma = 0;
  let heavyLetters = 0, qalqalah = 0, letters = 0;

  const heavyChars = new Set(['خ', 'ص', 'ض', 'ط', 'ظ', 'غ', 'ق']);
  const qalqalahChars = new Set(['ق', 'ط', 'ب', 'ج', 'د']);

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const code = ch.charCodeAt(0);
    if (code === 0x064E) fatha++;
    else if (code === 0x0650) kasra++;
    else if (code === 0x064F) damma++;
    else if (code === 0x064B) fathatan++;
    else if (code === 0x064D) kasratan++;
    else if (code === 0x064C) dammatan++;
    else if (code === 0x0652 || code === 0x06DF || code === 0x06E1) sukoon++;
    else if (code === 0x0651) shaddah++;
    else if (code === 0x0653 || code === 0x06E4) maddah++;
    else if (code === 0x0670) standingFatha++;
    else if (code === 0x0656) standingKasra++;
    else if (code === 0x0657) invertedDamma++;
    else if (/[\u0621-\u064A\u0671]/.test(ch)) {
      letters++;
      if (heavyChars.has(ch)) heavyLetters++;
      if (qalqalahChars.has(ch)) qalqalah++;
    }
  }

  return {
    letters, fatha, kasra, damma, fathatan, kasratan, dammatan,
    sukoon, shaddah, maddah, standingFatha, standingKasra, invertedDamma,
    heavyLetters, qalqalah
  };
}

// 3. Preload all 114 Surahs Tajweed Words
console.log('Preloading Tajweed word rules for all 114 Surahs...');
const tajweedAyahMap = new Map(); // key: "sNum:aNum" -> array of word objects

for (let sNum = 1; sNum <= 114; sNum++) {
  const sStr = String(sNum).padStart(3, '0');
  const filePath = path.resolve(`node_modules/react-native-quran-tajweed/src/data/surah_${sStr}.json`);
  if (!fs.existsSync(filePath)) continue;
  const sJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const aObj of sJson.ayahs) {
    const aNum = aObj.ayah;
    const wordsList = [];
    let curChars = [];
    let curRules = new Set();

    for (const [segText, segRules] of aObj.s) {
      const decodedRules = decodeRules(segRules);
      const color = resolveTajweedColor(decodedRules);

      for (let i = 0; i < segText.length; i++) {
        const ch = segText[i];
        if (ch === ' ') {
          if (curChars.length > 0) {
            const wText = curChars.map(c => c.char).join('');
            wordsList.push({
              text: wText,
              textClean: cleanArabicText(wText),
              characters: curChars,
              rules: Array.from(curRules),
              tajweedSummary: getTajweedLabel(Array.from(curRules)),
              diacritics: countDiacritics(wText)
            });
            curChars = [];
            curRules = new Set();
          }
        } else {
          curChars.push({ char: ch, rules: decodedRules, color });
          decodedRules.forEach(r => curRules.add(r));
        }
      }
    }

    if (curChars.length > 0) {
      const wText = curChars.map(c => c.char).join('');
      wordsList.push({
        text: wText,
        textClean: cleanArabicText(wText),
        characters: curChars,
        rules: Array.from(curRules),
        tajweedSummary: getTajweedLabel(Array.from(curRules)),
        diacritics: countDiacritics(wText)
      });
    }

    tajweedAyahMap.set(`${sNum}:${aNum}`, wordsList);
  }
}
console.log('Tajweed words preloaded successfully.');

// 4. Thematic Classifier
function getThematicSubjectForAyah(surah, ayah) {
  if (surah === 1) {
    if (ayah <= 4) return { id: 'faith_tawheed', titleArabic: 'الثناء على الله وعظيم ربوبيته ورحمته', titleUrdu: 'اللہ کی حمد و ثنا اور ربوبیت و رحمت' };
    return { id: 'believers_paradise', titleArabic: 'إخلاص العبادة والدعاء بالهداية', titleUrdu: 'خالص بندگی اور صراطِ مستقیم کی دعا' };
  }
  if (surah === 2) {
    if (ayah <= 5) return { id: 'believers_paradise', titleArabic: 'صفات المتقين ومآلهم وبشارتهم بالفلاح', titleUrdu: 'اہلِ تقویٰ کی بنیادی صفات اور کامیابی کی بشارت' };
    if (ayah <= 7) return { id: 'hypocrites_hellfire', titleArabic: 'صفات الكافرين وطمس بصائرهم', titleUrdu: 'کافروں کی سرکشی اور مہر' };
    if (ayah <= 16) return { id: 'hypocrites_hellfire', titleArabic: 'صفات المنافقين ومخادعتهم', titleUrdu: 'منافقین کی بیماریاں اور فریب' };
    if (ayah <= 20) return { id: 'wisdom_morals', titleArabic: 'ضرب الأمثال للمنافقين', titleUrdu: 'منافقین کے لیے آگ اور بارش کی تمثیل' };
    if (ayah <= 24) return { id: 'faith_tawheed', titleArabic: 'الدعوة إلى توحيد الله وإعجاز القرآن', titleUrdu: 'توحیدِ الٰہی کی دعوت اور قرآن کا اعجاز' };
    if (ayah === 25) return { id: 'believers_paradise', titleArabic: 'بشارة المؤمنين بجنات النعيم', titleUrdu: 'اہلِ ایمان کے لیے جنتی باغات کی بشارت' };
    if (ayah <= 29) return { id: 'faith_tawheed', titleArabic: 'مثل البعوضة وخلق السماوات والأرض', titleUrdu: 'مچھر کی تمثیل اور تخلیقِ کائنات' };
    if (ayah <= 39) return { id: 'prophets_stories', titleArabic: 'قصة خلق آدم عليه السلام وإبليس', titleUrdu: 'قصہ آدمؑ اور تکبرِ ابلیس' };
    if (ayah <= 61) return { id: 'prophets_stories', titleArabic: 'نعم الله على بني إسرائيل وفضل المن والسلوى', titleUrdu: 'بنی اسرائیل پر انعامات اور من و سلویٰ' };
    if (ayah <= 74) return { id: 'prophets_stories', titleArabic: 'قصة البقرة الصفراء وقسوة القلوب', titleUrdu: 'گائے کا قصہ اور دلوں کا سخت ہونا' };
    if (ayah <= 103) return { id: 'prophets_stories', titleArabic: 'تكذيب الرسل وفتنة السحر', titleUrdu: 'رسولوں کی تکذیب اور جادو کا فتنہ' };
    if (ayah <= 123) return { id: 'rulings_shariah', titleArabic: 'أدب مخاطبة النبي والنسخ', titleUrdu: 'آدابِ نبوت اور احکام کا نسخ' };
    if (ayah <= 141) return { id: 'prophets_stories', titleArabic: 'إمامة إبراهيم وبناء الكعبة', titleUrdu: 'امامتِ ابراہیمؑ اور تعمیرِ کعبہ' };
    if (ayah <= 152) return { id: 'rulings_shariah', titleArabic: 'تحويل القبلة إلى المسجد الحرام', titleUrdu: 'تحویلِ قبلہ اور ذکرِ الٰہی' };
    if (ayah <= 157) return { id: 'believers_paradise', titleArabic: 'الاستعانة بالصبر والصلاة وبشارة الصابرين', titleUrdu: 'صبر و نماز سے مدد اور صابرین کی بشارت' };
    if (ayah <= 167) return { id: 'faith_tawheed', titleArabic: 'شعائر الله ووحدانية الخالق', titleUrdu: 'شعائرِ الٰہی اور وحدانیت' };
    if (ayah <= 177) return { id: 'rulings_shariah', titleArabic: 'أكل الحلال وحقيقة البر والتقوى', titleUrdu: 'حلال کھانے اور نیکی و تقویٰ کی حقیقت' };
    if (ayah <= 182) return { id: 'rulings_shariah', titleArabic: 'أحكام القصاص والوصية', titleUrdu: 'قصاص اور وصیت کے احکام' };
    if (ayah <= 187) return { id: 'rulings_shariah', titleArabic: 'أحكام الصيام وفضل شهر رمضان', titleUrdu: 'روزے کے احکام اور فضیلتِ رمضان' };
    if (ayah <= 195) return { id: 'rulings_shariah', titleArabic: 'حرمة أموال الناس والجهاد في سبيل الله', titleUrdu: 'حرمتِ مال اور راہِ خدا میں جہاد' };
    if (ayah <= 203) return { id: 'rulings_shariah', titleArabic: 'مناسك الحج والعمرة والوقوف بعرفات', titleUrdu: 'حج و عمرہ کے احکام اور وقوفِ عرفات' };
    if (ayah <= 212) return { id: 'wisdom_morals', titleArabic: 'الدخول في السلم كافة وزينة الدنيا', titleUrdu: 'اسلام میں پورا داخل ہونا اور دنیاوی فتنہ' };
    if (ayah <= 220) return { id: 'rulings_shariah', titleArabic: 'الإنفاق والخمر والميسر واليتامى', titleUrdu: 'انفاق، شراب و جوئے کی ممانعت اور یتامیٰ' };
    if (ayah <= 242) return { id: 'rulings_shariah', titleArabic: 'أحكام النكاح والطلاق والعدة والرضاعة', titleUrdu: 'نکاح، طلاق، عدت اور رضاعت کے احکام' };
    if (ayah <= 252) return { id: 'prophets_stories', titleArabic: 'قصة طالوت وجالوت وداود عليه السلام', titleUrdu: 'طالوت و جالوت کا معرکہ اور حضرت داؤدؑ' };
    if (ayah <= 255) return { id: 'faith_tawheed', titleArabic: 'آية الكرسي العظيمة في صفات الله وتوحيده', titleUrdu: 'آیت الکرسی: عظمتِ الٰہی اور توحید' };
    if (ayah <= 260) return { id: 'faith_tawheed', titleArabic: 'لا إكراه في الدين ومحاجة إبراهيم', titleUrdu: 'دین میں زبردستی نہیں اور مناظرۂ ابراہیمؑ' };
    if (ayah <= 274) return { id: 'rulings_shariah', titleArabic: 'فضل الإنفاق ومضاعفة الأجر عند الله', titleUrdu: 'راہِ خدا میں خرچ اور مضاعف اجر' };
    if (ayah <= 281) return { id: 'rulings_shariah', titleArabic: 'تحريم الربا والوعيد الشديد للمرابين', titleUrdu: 'سود کی ممانعت اور وعید' };
    if (ayah <= 283) return { id: 'rulings_shariah', titleArabic: 'آية المداينة وكتابة الديون والإشهاد', titleUrdu: 'آیتِ مدائنت: لین دین کی دستاویز اور گواہی' };
    return { id: 'believers_paradise', titleArabic: 'خواتيم سورة البقرة في الإيمان والدعاء', titleUrdu: 'سورۃ البقرہ کا اختتام: ایمان اور دعائیں' };
  }
  if (surah === 3) {
    if (ayah <= 9) return { id: 'faith_tawheed', titleArabic: 'إحكام القرآن والمحكم والمتشابه', titleUrdu: 'محکم و متشابہ آیات اور علمِ قرآن' };
    if (ayah <= 32) return { id: 'faith_tawheed', titleArabic: 'شهادة التوحيد والإسلام دين الله', titleUrdu: 'توحید کی شہادت اور دینِ اسلام' };
    if (ayah <= 63) return { id: 'prophets_stories', titleArabic: 'قصة آل عمران ومريم وزكريا وعيسى', titleUrdu: 'آلِ عمران، مریمؑ، زکریاؑ اور عیسیٰؑ' };
    if (ayah <= 85) return { id: 'faith_tawheed', titleArabic: 'الدعوة إلى كلمة سواء وملة إبراهيم', titleUrdu: 'کلمۂ حق کی دعوت اور ملتِ ابراہیمی' };
    if (ayah <= 120) return { id: 'believers_paradise', titleArabic: 'الأمر بالمعروف والنهي عن المنكر والاعتصام', titleUrdu: 'امر بالمعروف، نہی عن المنکر اور اتحاد' };
    if (ayah <= 180) return { id: 'prophets_stories', titleArabic: 'غزوة أحد ودروس الصبر والشهداء', titleUrdu: 'غزوۂ احد کے تفصیلی واقعات اور اسباق' };
    if (ayah <= 195) return { id: 'faith_tawheed', titleArabic: 'دعاء أولي الألباب والتفكر في خلق السماوات', titleUrdu: 'اہلِ عقل کی سوچ، تدبر اور دعائیں' };
    return { id: 'believers_paradise', titleArabic: 'الأمر بالصبر والمصابرة والتقوى', titleUrdu: 'صبر، استقامت اور تقویٰ کی تاکید' };
  }
  if (surah === 4) return { id: 'rulings_shariah', titleArabic: 'الأحكام الشرعية والفرائض والحدود', titleUrdu: 'شرعی احکام، حقوق اور حدود' };
  if (surah >= 7 && surah <= 12) return { id: 'prophets_stories', titleArabic: 'قصص الأنبياء وسير الأولين والعبر', titleUrdu: 'انبیائے کرام کے واقعات اور اسباق' };
  if (surah >= 77 && surah <= 104) return { id: 'judgement_day', titleArabic: 'أهوال القيامة والبعث والجزاء والحساب', titleUrdu: 'قیامت کے احوال اور حساب و کتاب' };
  if (surah === 55 || surah === 56 || surah === 76) return { id: 'believers_paradise', titleArabic: 'نعيم الجنة وصفات عباد الرحمن والجزاء', titleUrdu: 'اہلِ ایمان کا اجر اور جنت کی نعمتیں' };
  if (surah === 63 || surah === 109 || surah === 111) return { id: 'hypocrites_hellfire', titleArabic: 'بيان صفات المنافقين وعذاب النار', titleUrdu: 'منافقین کے کرتوت اور عذابِ جہنم' };
  return { id: 'faith_tawheed', titleArabic: 'آيات الحكمة والبيان والتوحيد', titleUrdu: 'حکمت، توحید اور تدبر کی آیات' };
}

const VOCAB = {
  1: [
    { word: 'ٱلْعَـٰلَمِينَ', meaningArabic: 'أصناف الخلائق وكل ما سوى الله', meaningUrdu: 'تمام جہانوں کی مخلوقات', surahNumber: 1, ayahNumber: 2 },
    { word: 'يَوْمِ ٱلدِّينِ', meaningArabic: 'يوم الجزاء والحساب وهو القيامة', meaningUrdu: 'جزا اور بدلے کا دن (روزِ قیامت)', surahNumber: 1, ayahNumber: 4 },
    { word: 'ٱلصِّرَٰطَ', meaningArabic: 'الطريق المستقيم الواضح', meaningUrdu: 'سیدھا اور واضح راستہ', surahNumber: 1, ayahNumber: 6 },
    { word: 'ٱلْمَغْضُوبِ', meaningArabic: 'الذين عرفوا الحق وتركوه', meaningUrdu: 'جن پر غضب ہوا (حق جان کر چھوڑنے والے)', surahNumber: 1, ayahNumber: 7 },
    { word: 'ٱلضَّآلِّينَ', meaningArabic: 'الذين حادوا عن الحق جهلاً وضلالاً', meaningUrdu: 'جو جہالت اور نادانی سے بھٹک گئے', surahNumber: 1, ayahNumber: 7 }
  ],
  2: [
    { word: 'لَا رَيْبَ', meaningArabic: 'لا شك فيه بوجه من الوجوه', meaningUrdu: 'اس میں کسی قسم کا شک نہیں', surahNumber: 2, ayahNumber: 2 },
    { word: 'هُدًى', meaningArabic: 'هداية وإرشاد ودلالة على الحق', meaningUrdu: 'سراپا ہدایت اور رہنمائی', surahNumber: 2, ayahNumber: 2 },
    { word: 'ٱلْمُتَّقِينَ', meaningArabic: 'الذين اتقوا عذاب الله بطاعته', meaningUrdu: 'اللہ کی نافرمانی سے بچنے والے پرہیزگار', surahNumber: 2, ayahNumber: 2 },
    { word: 'بِٱلْغَيْبِ', meaningArabic: 'بما غاب عن الحواس وأخبر به الوحي', meaningUrdu: 'بن دیکھی حقیقتیں جن کی وحی نے خبر دی', surahNumber: 2, ayahNumber: 3 },
    { word: 'يُنفِقُونَ', meaningArabic: 'يخرجون الزكاة والنفقات في سبيل الله', meaningUrdu: 'اللہ کے راستے میں خرچ کرتے ہیں', surahNumber: 2, ayahNumber: 3 },
    { word: 'يُوقِنُونَ', meaningArabic: 'يعلمون علماً جازماً لا تردد فيه', meaningUrdu: 'پورا اور پختہ یقین رکھتے ہیں', surahNumber: 2, ayahNumber: 4 },
    { word: 'ٱلْمُفْلِحُونَ', meaningArabic: 'الفائزون بالمطلوب الناجون من المرهوب', meaningUrdu: 'کامیاب اور بامراد لوگ', surahNumber: 2, ayahNumber: 5 }
  ],
  3: [
    { word: 'سَوَآءٌ', meaningArabic: 'مستوٍ عندهم الإنذار وعدمه', meaningUrdu: 'ان کے لیے برابر ہے', surahNumber: 2, ayahNumber: 6 },
    { word: 'خَتَمَ', meaningArabic: 'طبع وأغلق فلا يدخل قلوبهم خير', meaningUrdu: 'مہر لگا دی کہ حق داخل نہ ہو', surahNumber: 2, ayahNumber: 7 },
    { word: 'غِشَـٰوَةٌ', meaningArabic: 'غطاء وستر عن رؤية الحق', meaningUrdu: 'آنکھوں پر پردہ', surahNumber: 2, ayahNumber: 7 },
    { word: 'يُخَـٰدِعُونَ', meaningArabic: 'يظهرون الإيمان ويبطنون الكفر', meaningUrdu: 'دھوکا اور فریب دینے کی کوشش کرتے ہیں', surahNumber: 2, ayahNumber: 9 },
    { word: 'مَّرَضٌ', meaningArabic: 'شك ونفاق وفساد في العقيدة', meaningUrdu: 'شک، منافقت اور باطنی بیماری', surahNumber: 2, ayahNumber: 10 }
  ]
};

function getMarginalVocabularyForPage(p) { return VOCAB[p] || []; }

// 5. Generate all 604 Pages
const outPublicPages = path.resolve('public/data/pages');
if (!fs.existsSync(outPublicPages)) fs.mkdirSync(outPublicPages, { recursive: true });

const allQuranPages = {};
const allPageStats = {};
const allPageThematic = {};
let globalWordId = 1;

for (let pNum = 1; pNum <= 604; pNum++) {
  const pStr = String(pNum).padStart(3, '0');
  const cachePath = path.resolve(`scripts/cache_604/page_${pStr}.json`);
  if (!fs.existsSync(cachePath)) {
    console.error(`Missing cache for page ${pNum}!`);
    continue;
  }

  const pRaw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const verses = pRaw.verses || [];

  const lineWordsMap = new Map();
  const surahsStartingOnPage = new Map();
  const pageSubjectsSet = new Map();

  for (const v of verses) {
    const [sNum, aNum] = v.verse_key.split(':').map(Number);
    const surahMeta = SURAHS.find(s => s.number === sNum) || { nameArabic: '', nameUrdu: '' };
    const tajWords = tajweedAyahMap.get(`${sNum}:${aNum}`) || [];
    const subjectInfo = getThematicSubjectForAyah(sNum, aNum);

    if (!pageSubjectsSet.has(subjectInfo.id)) {
      pageSubjectsSet.set(subjectInfo.id, {
        subjectId: subjectInfo.id,
        titleArabic: subjectInfo.titleArabic,
        titleUrdu: subjectInfo.titleUrdu,
        surahNumber: sNum,
        fromAyah: aNum,
        toAyah: aNum
      });
    } else {
      const existing = pageSubjectsSet.get(subjectInfo.id);
      existing.toAyah = Math.max(existing.toAyah, aNum);
    }

    let wordIdxInAyah = 0;
    for (const w of v.words) {
      const lineNum = w.line_number;
      if (!lineWordsMap.has(lineNum)) lineWordsMap.set(lineNum, []);

      if (aNum === 1 && wordIdxInAyah === 0 && w.char_type_name === 'word') {
        if (!surahsStartingOnPage.has(sNum)) {
          surahsStartingOnPage.set(sNum, lineNum);
        }
      }

      if (w.char_type_name === 'end') {
        const aNumAr = aNum.toLocaleString('ar-EG');
        const markerWord = {
          id: globalWordId++,
          surah: sNum,
          surahName: surahMeta.nameArabic,
          ayah: aNum,
          position: w.position,
          text: `۝${aNumAr}`,
          textClean: String(aNum),
          characters: [],
          rules: [],
          tajweedSummary: 'علامة الآية',
          diacritics: { letters: 0, fatha: 0, kasra: 0, damma: 0, fathatan: 0, kasratan: 0, dammatan: 0, sukoon: 0, shaddah: 0, maddah: 0, standingFatha: 0, standingKasra: 0, invertedDamma: 0, heavyLetters: 0, qalqalah: 0 },
          page: pNum,
          line: lineNum,
          isAyahMarker: true,
          markerText: `۝${aNumAr}`,
          subjectId: subjectInfo.id,
          subjectTitleArabic: subjectInfo.titleArabic,
          subjectTitleUrdu: subjectInfo.titleUrdu
        };
        lineWordsMap.get(lineNum).push(markerWord);
      } else {
        const tajWord = tajWords[wordIdxInAyah];
        const wText = w.text_uthmani || (tajWord ? tajWord.text : w.text);
        const wClean = tajWord ? tajWord.textClean : cleanArabicText(wText);
        const wChars = tajWord ? tajWord.characters : [];
        const wRules = tajWord ? tajWord.rules : [];
        const wSummary = tajWord ? tajWord.tajweedSummary : 'عام تلفظ (Normal)';
        const wDiacritics = tajWord ? tajWord.diacritics : countDiacritics(wText);

        const wordObj = {
          id: globalWordId++,
          surah: sNum,
          surahName: surahMeta.nameArabic,
          ayah: aNum,
          position: w.position,
          text: wText,
          textClean: wClean,
          characters: wChars,
          rules: wRules,
          tajweedSummary: wSummary,
          diacritics: wDiacritics,
          page: pNum,
          line: lineNum,
          subjectId: subjectInfo.id,
          subjectTitleArabic: subjectInfo.titleArabic,
          subjectTitleUrdu: subjectInfo.titleUrdu
        };
        lineWordsMap.get(lineNum).push(wordObj);
        wordIdxInAyah++;
      }
    }
  }

  // Construct exactly 15 Lines
  const lines = [];
  const headerMap = new Map();
  for (const [sNum, firstVerseLine] of surahsStartingOnPage.entries()) {
    const surahMeta = SURAHS.find(s => s.number === sNum) || { nameArabic: '', totalAyahs: 0, revelationType: 'Makki' };
    if (sNum === 1) {
      headerMap.set(1, {
        lineNumber: 1,
        isHeader: true,
        headerType: 'surah_title',
        surahNumber: 1,
        surahName: surahMeta.nameArabic,
        totalAyahs: surahMeta.totalAyahs,
        revelationType: surahMeta.revelationType,
        includeBismillah: false,
        words: []
      });
    } else if (sNum === 9) {
      const hLine = Math.max(1, firstVerseLine - 1);
      headerMap.set(hLine, {
        lineNumber: hLine,
        isHeader: true,
        headerType: 'surah_title',
        surahNumber: sNum,
        surahName: surahMeta.nameArabic,
        totalAyahs: surahMeta.totalAyahs,
        revelationType: surahMeta.revelationType,
        includeBismillah: false,
        words: []
      });
    } else {
      const titleLine = Math.max(1, firstVerseLine - 2);
      const bismillahLine = Math.max(1, firstVerseLine - 1);
      headerMap.set(titleLine, {
        lineNumber: titleLine,
        isHeader: true,
        headerType: 'surah_title',
        surahNumber: sNum,
        surahName: surahMeta.nameArabic,
        totalAyahs: surahMeta.totalAyahs,
        revelationType: surahMeta.revelationType,
        includeBismillah: false,
        words: []
      });
      headerMap.set(bismillahLine, {
        lineNumber: bismillahLine,
        isHeader: true,
        headerType: 'bismillah',
        surahNumber: sNum,
        surahName: surahMeta.nameArabic,
        words: []
      });
    }
  }

  for (let l = 1; l <= 15; l++) {
    if (headerMap.has(l)) {
      lines.push(headerMap.get(l));
    } else {
      const words = lineWordsMap.get(l) || [];
      const dominantSubject = words.find(w => w.subjectId)?.subjectId;
      lines.push({
        lineNumber: l,
        isHeader: false,
        subjectId: dominantSubject,
        words
      });
    }
  }

  const pageData = {
    pageNumber: pNum,
    isQuranText: true,
    isIlluminated: pNum === 1 || pNum === 2,
    lines
  };

  allQuranPages[pNum] = pageData;
  fs.writeFileSync(path.join(outPublicPages, `page_${pStr}.json`), JSON.stringify(pageData));

  // Compute Page Statistics
  let totalWords = 0, totalLetters = 0;
  let countFatha = 0, countKasra = 0, countDamma = 0;
  let countFathatan = 0, countKasratan = 0, countDammatan = 0;
  let countSukoon = 0, countShaddah = 0, countMaddah = 0;
  let countStandingFatha = 0, countStandingKasra = 0, countInvertedDamma = 0;
  let countHeavyLetters = 0, countQalqalah = 0;

  for (const line of lines) {
    for (const w of line.words) {
      if (w.isAyahMarker) continue;
      totalWords++;
      const d = w.diacritics;
      totalLetters += d.letters;
      countFatha += d.fatha;
      countKasra += d.kasra;
      countDamma += d.damma;
      countFathatan += d.fathatan;
      countKasratan += d.kasratan;
      countDammatan += d.dammatan;
      countSukoon += d.sukoon;
      countShaddah += d.shaddah;
      countMaddah += d.maddah;
      countStandingFatha += d.standingFatha;
      countStandingKasra += d.standingKasra;
      countInvertedDamma += d.invertedDamma;
      countHeavyLetters += d.heavyLetters;
      countQalqalah += d.qalqalah;
    }
  }

  allPageStats[pNum] = {
    pageNumber: pNum,
    isQuranText: true,
    totalWords,
    totalLetters,
    countFatha, countKasra, countDamma,
    countFathatan, countKasratan, countDammatan,
    countSukoon, countShaddah, countMaddah,
    countStandingFatha, countStandingKasra, countInvertedDamma,
    countHeavyLetters, countQalqalah,
    isCalculated: true
  };

  allPageThematic[pNum] = {
    pageNumber: pNum,
    subjects: Array.from(pageSubjectsSet.values()),
    vocabulary: getMarginalVocabularyForPage(pNum)
  };
}

console.log('Writing aggregated quranPages.json (604 pages)...');
fs.writeFileSync(path.resolve('src/data/quranPages.json'), JSON.stringify(allQuranPages));

console.log('Writing aggregated pageStatistics.json (604 pages)...');
fs.writeFileSync(path.resolve('src/data/pageStatistics.json'), JSON.stringify(allPageStats));

console.log('Writing aggregated pageThematicData.json (604 pages)...');
fs.writeFileSync(path.resolve('src/data/pageThematicData.json'), JSON.stringify(allPageThematic, null, 2));

console.log('All 604 Madani Thematic pages generated successfully!');
