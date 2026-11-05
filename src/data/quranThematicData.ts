import { ThematicSubject, ThematicSubjectId, PageSubjectRange, MarginalWordMeaning } from '../types/quran';

/**
 * The 7 authentic Thematic Categories of 'مصحف التفصيل الموضوعي' (Dar Al-Fajr)
 * Calibrated with gentle pastel background tints for daytime reading and
 * rich harmonious translucent tints for dark mode.
 */
export const THEMATIC_SUBJECTS: Record<ThematicSubjectId, ThematicSubject> = {
  faith_tawheed: {
    id: 'faith_tawheed',
    nameArabic: 'العقيدة ودلائل القدرة والتوحيد',
    nameUrdu: 'عقیدہ، توحید اور قدرتِ الٰہی کے دلائل',
    nameEnglish: 'Faith, Monotheism & Divine Signs',
    descriptionUrdu: 'اللہ تعالیٰ کی وحدانیت، ربوبیت، کائنات میں قدرت کی نشانیاں اور ایمانیات کے دلائل۔',
    colorLight: '#e0f2fe',       // Soft pastel sky blue
    colorBorderLight: '#7dd3fc',
    colorDark: '#0c2e4e',        // Deep navy night tint
    colorBorderDark: '#0284c7',
    badgeBg: '#0284c7',
    badgeText: '#ffffff',
    iconName: 'Compass'
  },
  believers_paradise: {
    id: 'believers_paradise',
    nameArabic: 'صفات المؤمنين وجزاؤهم ونعيم الجنة',
    nameUrdu: 'اہلِ ایمان کی صفات، اجر اور جنت کی نعمتیں',
    nameEnglish: 'Believers, Righteous Deeds & Paradise',
    descriptionUrdu: 'متقین، مومنین اور صالحین کے اوصاف، ان کے اعمال، بشارتیں اور جنت کی ابدی نعمتیں۔',
    colorLight: '#dcfce7',       // Soft pastel mint / emerald
    colorBorderLight: '#86efac',
    colorDark: '#064e3b',        // Forest emerald night tint
    colorBorderDark: '#10b981',
    badgeBg: '#059669',
    badgeText: '#ffffff',
    iconName: 'Sparkles'
  },
  prophets_stories: {
    id: 'prophets_stories',
    nameArabic: 'قصص الأنبياء والرسل والأمم السابقة',
    nameUrdu: 'انبیائے کرام، رسل اور گزشتہ اقوام کے واقعات',
    nameEnglish: 'Stories of Prophets & Past Nations',
    descriptionUrdu: 'حضرات انبیاء علیہم السلام کی جدوجہد، دعوت، معجزات اور سابقہ قوموں کے تاریخی اسباق۔',
    colorLight: '#fef3c7',       // Soft warm amber / sunlit gold
    colorBorderLight: '#fcd34d',
    colorDark: '#452b06',        // Amber gold night tint
    colorBorderDark: '#d97706',
    badgeBg: '#d97706',
    badgeText: '#ffffff',
    iconName: 'BookOpen'
  },
  rulings_shariah: {
    id: 'rulings_shariah',
    nameArabic: 'الأحكام والتشريعات والفرائض والمعاملات',
    nameUrdu: 'شرعی احکام، عبادات، فرائض اور اخلاقی حدود',
    nameEnglish: 'Islamic Rulings, Worship & Commandments',
    descriptionUrdu: 'نماز، روزہ، زکوٰۃ، حج، معاشرتی احکام، نکاح، وراثت، جہاد اور معاملات کی ہدایات۔',
    colorLight: '#ffedd5',       // Soft warm peach / light apricot
    colorBorderLight: '#fdba74',
    colorDark: '#4a2307',        // Warm bronze night tint
    colorBorderDark: '#ea580c',
    badgeBg: '#ea580c',
    badgeText: '#ffffff',
    iconName: 'Scale'
  },
  judgement_day: {
    id: 'judgement_day',
    nameArabic: 'أهوال القيامة والبعث والحساب والجزاء',
    nameUrdu: 'قیامت کے احوال، بعث، نامۂ اعمال اور حساب و کتاب',
    nameEnglish: 'Day of Judgement, Resurrection & Reckoning',
    descriptionUrdu: 'صور پھونکا جانا، قیامت کی نشانیاں، دوبارہ زندہ ہونا، عدالتِ الٰہی اور جزاء و سزا کا دن۔',
    colorLight: '#fee2e2',       // Soft pastel crimson / rose
    colorBorderLight: '#fca5a5',
    colorDark: '#4c1111',        // Crimson garnet night tint
    colorBorderDark: '#dc2626',
    badgeBg: '#dc2626',
    badgeText: '#ffffff',
    iconName: 'Flame'
  },
  hypocrites_hellfire: {
    id: 'hypocrites_hellfire',
    nameArabic: 'صفات المنافقين والكافرين ومصيرهم والنار',
    nameUrdu: 'منافقین اور منکرین کے احوال اور جہنم کی وعید',
    nameEnglish: 'Disbelievers, Hypocrites & Warning of Hellfire',
    descriptionUrdu: 'کفر، نفاق، مکذبوں کی حیلہ سازیاں، ان کے عیوب اور جہنم کی ہولناک سزاؤں سے انتباہ۔',
    colorLight: '#f3e8ff',       // Soft lavender / amethyst
    colorBorderLight: '#d8b4fe',
    colorDark: '#35114e',        // Royal purple night tint
    colorBorderDark: '#9333ea',
    badgeBg: '#7e22ce',
    badgeText: '#ffffff',
    iconName: 'ShieldAlert'
  },
  wisdom_morals: {
    id: 'wisdom_morals',
    nameArabic: 'الأمثال والحكم والآداب والمواعظ الإلهية',
    nameUrdu: 'قرآنی تمثیلات، دانائی، اخلاقیات اور الٰہی نصیحتیں',
    nameEnglish: 'Parables, Divine Wisdom & Ethics',
    descriptionUrdu: 'قرآنی مثالیں، دانائی و حکمت کی باتیں، حسنِ اخلاق، تدبر اور عمومی وعظ و نصیحت۔',
    colorLight: '#f1f5f9',       // Soft slate / gentle pearl
    colorBorderLight: '#cbd5e1',
    colorDark: '#1e293b',        // Slate graphite night tint
    colorBorderDark: '#64748b',
    badgeBg: '#475569',
    badgeText: '#ffffff',
    iconName: 'Scroll'
  }
};

/**
 * Array of subjects for UI selectors and filters
 */
export const THEMATIC_SUBJECTS_LIST = Object.values(THEMATIC_SUBJECTS);

/**
 * Surah-level and Passage-level thematic classification across the Quran
 */
export interface ThematicPassageRule {
  surah: number;
  fromAyah: number;
  toAyah: number;
  subjectId: ThematicSubjectId;
  titleArabic: string;
  titleUrdu: string;
}

/**
 * Comprehensive Thematic Classification covering all 114 Surahs
 */
export const THEMATIC_PASSAGES: ThematicPassageRule[] = [
  // 1. Al-Fatiha
  { surah: 1, fromAyah: 1, toAyah: 4, subjectId: 'faith_tawheed', titleArabic: 'الثناء على الله وعظيم ربوبيته ورحمته', titleUrdu: 'اللہ تعالیٰ کی حمد و ثنا اور ربوبیت و رحمت کا بیان' },
  { surah: 1, fromAyah: 5, toAyah: 7, subjectId: 'believers_paradise', titleArabic: 'إخلاص العبادة والدعاء بالهداية للصراط المستقيم', titleUrdu: 'خالص بندگی اور صراطِ مستقیم کی دعا' },

  // 2. Al-Baqarah
  { surah: 2, fromAyah: 1, toAyah: 5, subjectId: 'believers_paradise', titleArabic: 'صفات المتقين ومآلهم وبشارتهم بالفلاح', titleUrdu: 'اہلِ تقویٰ کی بنیادی صفات اور ان کی کامیابی کی بشارت' },
  { surah: 2, fromAyah: 6, toAyah: 7, subjectId: 'hypocrites_hellfire', titleArabic: 'صفات الكافرين وطمس بصائرهم', titleUrdu: 'کافروں کی سرکشی اور ان کے دلوں پر مہر' },
  { surah: 2, fromAyah: 8, toAyah: 16, subjectId: 'hypocrites_hellfire', titleArabic: 'صفات المنافقين ومخادعتهم ومرض قلوبهم', titleUrdu: 'منافقین کی چالاکیاں، دلی بیماریاں اور فریب' },
  { surah: 2, fromAyah: 17, toAyah: 20, subjectId: 'wisdom_morals', titleArabic: 'ضرب الأمثال للمنافقين بالنار والصيب', titleUrdu: 'منافقین کے لیے آگ اور بارش کی تمثیل' },
  { surah: 2, fromAyah: 21, toAyah: 24, subjectId: 'faith_tawheed', titleArabic: 'الدعوة إلى توحيد الله وتحدي الإنس والجن بالقرآن', titleUrdu: 'توحیدِ الٰہی کی دعوت اور قرآن مجید کا اعجاز' },
  { surah: 2, fromAyah: 25, toAyah: 25, subjectId: 'believers_paradise', titleArabic: 'بشارة المؤمنين بجنات تجري من تحتها الأنهار', titleUrdu: 'اہلِ ایمان کے لیے جنتی باغات اور پاکیزہ نعمتوں کی بشارت' },
  { surah: 2, fromAyah: 26, toAyah: 29, subjectId: 'faith_tawheed', titleArabic: 'ضرب المثل بالبعوضة ودلائل خلق السماوات والأرض', titleUrdu: 'مچھر کی تمثیل اور زمین و آسمان کی تخلیق کے دلائل' },
  { surah: 2, fromAyah: 30, toAyah: 39, subjectId: 'prophets_stories', titleArabic: 'قصة خلق آدم عليه السلام واستكبار إبليس والنزول للأرض', titleUrdu: 'تخلیقِ آدمؑ، فرشتوں کا سجدہ، ابلیس کا تکبر اور ہبوطِ زمین' },
  { surah: 2, fromAyah: 40, toAyah: 48, subjectId: 'prophets_stories', titleArabic: 'تذكير بني إسرائيل بالنعم والتحذير من كتمان الحق', titleUrdu: 'بنی اسرائیل کو نعمتوں کی یاد دہانی اور کتمانِ حق سے تنبیہ' },
  { surah: 2, fromAyah: 49, toAyah: 61, subjectId: 'prophets_stories', titleArabic: 'نجاة بني إسرائيل من آل فرعون ونعم المن والسلوى', titleUrdu: 'آلِ فرعون سے نجات، من و سلویٰ اور بادلوں کا سایہ' },
  { surah: 2, fromAyah: 62, toAyah: 62, subjectId: 'believers_paradise', titleArabic: 'أجر من آمن وعمل صالحاً عند ربه', titleUrdu: 'ایمان و عملِ صالح کا دائمی اجر' },
  { surah: 2, fromAyah: 63, toAyah: 74, subjectId: 'prophets_stories', titleArabic: 'ميثاق الطور وقصة البقرة الصفراء وقسوة القلوب', titleUrdu: 'کوہِ طور کا عہد، گائے کا قصہ اور دلوں کی سختی' },
  { surah: 2, fromAyah: 75, toAyah: 86, subjectId: 'hypocrites_hellfire', titleArabic: 'تحريف أهل الكتاب ونقضهم العهود وجزاؤهم الخزي', titleUrdu: 'عہد شکنی، کلامِ الٰہی میں تحریف اور دنیا و آخرت کی رسوائی' },
  { surah: 2, fromAyah: 87, toAyah: 103, subjectId: 'prophets_stories', titleArabic: 'تكذيب الرسل وفتنة هاروت وماروت والسحر', titleUrdu: 'رسولوں کی تکذیب، ہاروت و ماروت اور جادو کا فتنہ' },
  { surah: 2, fromAyah: 104, toAyah: 123, subjectId: 'rulings_shariah', titleArabic: 'أدب مخاطبة النبي والنسخ ومواقف أهل الكتاب', titleUrdu: 'آدابِ رسالت، احکام کا نسخ اور قبلہ کے احکام' },
  { surah: 2, fromAyah: 124, toAyah: 141, subjectId: 'prophets_stories', titleArabic: 'إمامة إبراهيم عليه السلام وبناء الكعبة ودعاؤه بالبركة', titleUrdu: 'امامتِ ابراہیمؑ، تعمیرِ کعبہ اور مکہ مکرمہ کے لیے دعائیں' },
  { surah: 2, fromAyah: 142, toAyah: 152, subjectId: 'rulings_shariah', titleArabic: 'تحويل القبلة إلى المسجد الحرام والأمر بالذكر والشكر', titleUrdu: 'تحویلِ قبلہ اور ذکر و شکرِ الٰہی کی تاکید' },
  { surah: 2, fromAyah: 153, toAyah: 157, subjectId: 'believers_paradise', titleArabic: 'الاستعانة بالصبر والصلاة وبشارة الصابرين', titleUrdu: 'صبر اور نماز سے مدد، اور صابرین کے لیے رحمت و بشارت' },
  { surah: 2, fromAyah: 158, toAyah: 167, subjectId: 'faith_tawheed', titleArabic: 'شعائر الصفا والمروة ووحدانية الله وتبرؤ المتبوعين', titleUrdu: 'صفا و مروہ کی نشانیاں اور وحدانیتِ پروردگار' },
  { surah: 2, fromAyah: 168, toAyah: 177, subjectId: 'rulings_shariah', titleArabic: 'أكل الحلال والمحرمات من الأطعمة وحقيقة البر والتقوى', titleUrdu: 'حلال و حرام کھانے اور نیکی و تقویٰ کی جامع حقیقت' },
  { surah: 2, fromAyah: 178, toAyah: 182, subjectId: 'rulings_shariah', titleArabic: 'أحكام القصاص في القتلى والوصية للوالدين', titleUrdu: 'قصاص کے احکام اور والدین کے لیے وصیت' },
  { surah: 2, fromAyah: 183, toAyah: 187, subjectId: 'rulings_shariah', titleArabic: 'أحكام الصيام وفضل شهر رمضان والاعتكاف', titleUrdu: 'روزے کے احکام، ماہِ رمضان کے فضائل اور اعتکاف' },
  { surah: 2, fromAyah: 188, toAyah: 195, subjectId: 'rulings_shariah', titleArabic: 'حرمة أكل أموال الناس بالباطل والقتال في سبيل الله', titleUrdu: 'ناحق مال کھانے کی ممانعت اور راہِ خدا میں جہاد' },
  { surah: 2, fromAyah: 196, toAyah: 203, subjectId: 'rulings_shariah', titleArabic: 'أحكام الحج والعمرة والوقوف بعرفات وأيام التشريق', titleUrdu: 'حج و عمرہ کے مناسک، وقوفِ عرفات اور ایامِ تشریق' },
  { surah: 2, fromAyah: 204, toAyah: 212, subjectId: 'wisdom_morals', titleArabic: 'أصناف الناس والدخول في السلم كافة وزينة الدنيا', titleUrdu: 'انسانوں کے مختلف رویے اور اسلام میں پورے داخل ہونے کا حکم' },
  { surah: 2, fromAyah: 213, toAyah: 220, subjectId: 'rulings_shariah', titleArabic: 'الإنفاق وحكم الخمر والميسر وكفالة اليتامى', titleUrdu: 'راہِ خدا میں خرچ، شراب و جوئے کی ممانعت اور یتیموں کے حقوق' },
  { surah: 2, fromAyah: 221, toAyah: 242, subjectId: 'rulings_shariah', titleArabic: 'أحكام النكاح والطلاق والعدة والرضاعة والمتعة', titleUrdu: 'نکاح، طلاق، عدت، رضاعت اور خاندانی معاملات کے قوانین' },
  { surah: 2, fromAyah: 243, toAyah: 252, subjectId: 'prophets_stories', titleArabic: 'قصة طالوت وجالوت وقتل داود لجالوت', titleUrdu: 'طالوت و جالوت کا معرکہ اور حضرت داؤدؑ کی فتح' },
  { surah: 2, fromAyah: 253, toAyah: 255, subjectId: 'faith_tawheed', titleArabic: 'تفاضل الرسل وآية الكرسي العظيمة في صفات الله', titleUrdu: 'رسولوں کے مراتب اور آیت الکرسی میں اللہ کی جلالت' },
  { surah: 2, fromAyah: 256, toAyah: 260, subjectId: 'faith_tawheed', titleArabic: 'لا إكراه في الدين ومحاجة إبراهيم وإحياء الموتى', titleUrdu: 'دین میں زبردستی نہیں، نمرود سے مناظرہ اور مردوں کو زندہ کرنا' },
  { surah: 2, fromAyah: 261, toAyah: 274, subjectId: 'rulings_shariah', titleArabic: 'فضل الإنفاق ومضاعفة الأجر وآداب الصدقات', titleUrdu: 'راہِ خدا میں خرچ کی فضیلت، آداب اور سات سو گنا اجر' },
  { surah: 2, fromAyah: 275, toAyah: 281, subjectId: 'rulings_shariah', titleArabic: 'تحريم الربا والوعيد الشديد للمرابين ويوم الترجيع', titleUrdu: 'سود کی سخت ترین ممانعت اور روزِ جزا کی یاد دہانی' },
  { surah: 2, fromAyah: 282, toAyah: 283, subjectId: 'rulings_shariah', titleArabic: 'آية المداينة وتوثيق الديون والإشهاد والرهان', titleUrdu: 'آیتِ مدائنت: قرض کی دستاویز، گواہی اور رہن کے احکام' },
  { surah: 2, fromAyah: 284, toAyah: 286, subjectId: 'believers_paradise', titleArabic: 'خواتيم سورة البقرة في الإيمان والدعاء بالرحمة والمغفرة', titleUrdu: 'سورۃ البقرہ کا اختتام: ایمانِ مفصل اور مغفرت و نصرت کی دعائیں' },

  // 3. Ali 'Imran
  { surah: 3, fromAyah: 1, toAyah: 9, subjectId: 'faith_tawheed', titleArabic: 'إحكام القرآن والمحكم والمتشابه وعلم الراسخين', titleUrdu: 'قرآن مجید کے محکم و متشابہ آیات اور راسخین فی العلم' },
  { surah: 3, fromAyah: 10, toAyah: 17, subjectId: 'judgement_day', titleArabic: 'زينة الشهوات وبشارة المتقين بالنعيم عند الله', titleUrdu: 'دنیاوی خواہشات کی حقیقت اور اہل تقویٰ کے لیے انعامات' },
  { surah: 3, fromAyah: 18, toAyah: 27, subjectId: 'faith_tawheed', titleArabic: 'شهادة التوحيد وإن الدين عند الله الإسلام وملكوت السماوات', titleUrdu: 'توحید کی شہادت، دینِ اسلام اور تمام بادشاہی کا مالک اللہ' },
  { surah: 3, fromAyah: 28, toAyah: 32, subjectId: 'wisdom_morals', titleArabic: 'محبة الله واتباع النبي والنهي عن موالاة الكافرين', titleUrdu: 'محبتِ الٰہی کی بنیاد اتباعِ رسولﷺ' },
  { surah: 3, fromAyah: 33, toAyah: 63, subjectId: 'prophets_stories', titleArabic: 'قصة آل عمران ومريم وزكريا وولادة عيسى عليه السلام', titleUrdu: 'آلِ عمران، ولادتِ مریمؑ، زکریاؑ اور حضرت عیسیٰؑ کی پیدائش' },
  { surah: 3, fromAyah: 64, toAyah: 85, subjectId: 'faith_tawheed', titleArabic: 'الدعوة إلى كلمة سواء وملة إبراهيم الحنيفية', titleUrdu: 'کلمۂ حق کی طرف دعوت اور دینِ ابراہیمی کی سچائی' },
  { surah: 3, fromAyah: 86, toAyah: 101, subjectId: 'rulings_shariah', titleArabic: 'لن تنالوا البر حتى تنفقوا والاعتصام بحبل الله جميعاً', titleUrdu: 'نیکی کا معیار اور اللہ کی رسی کو مضبوطی سے تھامنا' },
  { surah: 3, fromAyah: 102, toAyah: 120, subjectId: 'believers_paradise', titleArabic: 'الأمر بالمعروف والنهي عن المنكر وكنتم خير أمة', titleUrdu: 'امر بالمعروف، نہی عن المنکر اور خیرِ امت کی ذمہ داری' },
  { surah: 3, fromAyah: 121, toAyah: 180, subjectId: 'prophets_stories', titleArabic: 'غزوة أحد ودروس النصر والهزيمة والابتلاء والشهداء', titleUrdu: 'غزوۂ احد کے تفصیلی واقعات، اسباق، شہادت اور آزمائشیں' },
  { surah: 3, fromAyah: 181, toAyah: 195, subjectId: 'faith_tawheed', titleArabic: 'دعاء أولي الألباب والتفكر في خلق السماوات والأرض', titleUrdu: 'اہلِ عقل کی سوچ، زمین و آسمان کی تخلیق میں تدبر اور دعائیں' },
  { surah: 3, fromAyah: 196, toAyah: 200, subjectId: 'believers_paradise', titleArabic: 'متاع الدنيا القليل والأمر بالصبر والمصابرة والرباط', titleUrdu: 'صبر، استقامت، سرحدوں کی نگہبانی اور تقویٰ کی تاکید' },

  // 4. An-Nisa
  { surah: 4, fromAyah: 1, toAyah: 14, subjectId: 'rulings_shariah', titleArabic: 'تقوى الله في الأرحام وأموال اليتامى وقسمة المواريث والفرائض', titleUrdu: 'صلہ رحمی، یتیموں کے حقوق اور وراثت کی شرعی تقسیم' },
  { surah: 4, fromAyah: 15, toAyah: 25, subjectId: 'rulings_shariah', titleArabic: 'حدود الفواحش وشروط التوبة والمحرمات من النساء في النكاح', titleUrdu: 'توبہ کے احکام اور نکاح میں حرام عورتوں کی تفصیل' },
  { surah: 4, fromAyah: 26, toAyah: 35, subjectId: 'rulings_shariah', titleArabic: 'قوامة الرجال وحل النزاع الزوجي واجتناب كبائر الإثم', titleUrdu: 'مردوں کی سربراہی، ازدواجی مصالحت اور کبائر سے پرہیز' },
  { surah: 4, fromAyah: 36, toAyah: 42, subjectId: 'wisdom_morals', titleArabic: 'حقوق الوالدين والجار وذوي القربى وذم البخل والرياء', titleUrdu: 'والدین، رشتہ داروں اور پڑوسیوں کے حقوق اور بخل کی مذمت' },
  { surah: 4, fromAyah: 43, toAyah: 57, subjectId: 'rulings_shariah', titleArabic: 'أحكام التيمم وأداء الأمانات والعدل في الحكم والجنة', titleUrdu: 'تیمم کے احکام، امانتوں کی ادائیگی اور عدل و انصاف' },
  { surah: 4, fromAyah: 58, toAyah: 70, subjectId: 'rulings_shariah', titleArabic: 'طاعة الله والرسول وأولي الأمر والرد إلى الله ورسوله', titleUrdu: 'اطاعتِ الٰہی و نبوی اور تنازعات میں قرآن و سنت سے رجوع' },
  { surah: 4, fromAyah: 71, toAyah: 104, subjectId: 'rulings_shariah', titleArabic: 'الجهاد في سبيل الله وصلاة الخوف وقصر الصلاة في السفر', titleUrdu: 'جہاد، ہجرت، قصر نماز اور نمازِ خوف کے احکام' },
  { surah: 4, fromAyah: 105, toAyah: 126, subjectId: 'rulings_shariah', titleArabic: 'التحذير من الخيانة والنجوى والشرك والعدل لليتامى', titleUrdu: 'خیانت سے پرہیز، خفیہ سرگوشیاں اور یتیم لڑکیوں سے انصاف' },
  { surah: 4, fromAyah: 127, toAyah: 152, subjectId: 'faith_tawheed', titleArabic: 'القيام بالقسط ومواقف المنافقين والرد على مزاعمهم', titleUrdu: 'انصاف پر قائم رہنا اور منافقین کے دہرے رویے' },
  { surah: 4, fromAyah: 153, toAyah: 176, subjectId: 'prophets_stories', titleArabic: 'افتراء أهل الكتاب على عيسى وحكم الكلالة في الميراث', titleUrdu: 'حضرت عیسیٰؑ کی حقیقت، رسالت کی گواہی اور کلالہ کی وراثت' }
];

/**
 * Marginal Vocabulary Database for key pages
 * (معاني المفردات وتفسير غريب القرآن على الحاشية)
 */
export const MARGINAL_VOCABULARY_DATA: Record<number, MarginalWordMeaning[]> = {
  1: [
    { word: 'ٱلْعَـٰلَمِينَ', meaningArabic: 'أصناف الخلائق وكل ما سوى الله', meaningUrdu: 'تمام جہانوں کی مخلوقات', surahNumber: 1, ayahNumber: 2 },
    { word: 'يَوْمِ ٱلدِّينِ', meaningArabic: 'يوم الجزاء والحساب وهو القيامة', meaningUrdu: 'جزا اور بدلے کا دن (روزِ قیامت)', surahNumber: 1, ayahNumber: 4 },
    { word: 'ٱلصِّرَٰطَ', meaningArabic: 'الطريق المستقيم الواضح', meaningUrdu: 'سیدھا اور واضح راستہ', surahNumber: 1, ayahNumber: 6 },
    { word: 'ٱلْمَغْضُوبِ', meaningArabic: 'الذين عرفوا الحق وتركوه', meaningUrdu: 'جن پر غضب ہوا (حق جان کر چھوڑنے والے)', surahNumber: 1, ayahNumber: 7 },
    { word: 'ٱلضَّآلِّينَ', meaningArabic: 'الذين حادوا عن الحق جهلاً وضلالاً', meaningUrdu: 'جو جہالت اور نادانی سے بھٹک گئے', surahNumber: 1, ayahNumber: 7 },
  ],
  2: [
    { word: 'لَا رَيْبَ', meaningArabic: 'لا شك فيه بوجه من الوجوه', meaningUrdu: 'اس میں کسی قسم کا شک نہیں', surahNumber: 2, ayahNumber: 2 },
    { word: 'هُدًى', meaningArabic: 'هداية وإرشاد ودلالة على الحق', meaningUrdu: 'سراپا ہدایت اور رہنمائی', surahNumber: 2, ayahNumber: 2 },
    { word: 'ٱلْمُتَّقِينَ', meaningArabic: 'الذين اتقوا عذاب الله بطاعته', meaningUrdu: 'اللہ کی نافرمانی سے بچنے والے پرہیزگار', surahNumber: 2, ayahNumber: 2 },
    { word: 'بِٱلْغَيْبِ', meaningArabic: 'بما غاب عن الحواس وأخبر به الوحي', meaningUrdu: 'بن دیکھی حقیقتیں جن کی وحی نے خبر دی', surahNumber: 2, ayahNumber: 3 },
    { word: 'يُنفِقُونَ', meaningArabic: 'يخرجون الزكاة والنفقات في سبيل الله', meaningUrdu: 'اللہ کے راستے میں خرچ کرتے ہیں', surahNumber: 2, ayahNumber: 3 },
    { word: 'يُوقِنُونَ', meaningArabic: 'يعلمون علماً جازماً لا تردد فيه', meaningUrdu: 'پورا اور پختہ یقین رکھتے ہیں', surahNumber: 2, ayahNumber: 4 },
    { word: 'ٱلْمُفْلِحُونَ', meaningArabic: 'الفائزون بالمطلوب الناجون من المرهوب', meaningUrdu: 'کامیاب اور بامراد لوگ', surahNumber: 2, ayahNumber: 5 },
  ],
  3: [
    { word: 'سَوَآءٌ', meaningArabic: 'مستوٍ عندهم الإنذار وعدمه', meaningUrdu: 'ان کے لیے برابر ہے', surahNumber: 2, ayahNumber: 6 },
    { word: 'خَتَمَ', meaningArabic: 'طبع وأغلق فلا يدخل قلوبهم خير', meaningUrdu: 'مہر لگا دی کہ حق داخل نہ ہو', surahNumber: 2, ayahNumber: 7 },
    { word: 'غِشَـٰوَةٌ', meaningArabic: 'غطاء وستر عن رؤية الحق', meaningUrdu: 'آنکھوں پر پردہ', surahNumber: 2, ayahNumber: 7 },
    { word: 'يُخَـٰدِعُونَ', meaningArabic: 'يظهرون الإيمان ويبطنون الكفر', meaningUrdu: 'دھوکا اور فریب دینے کی کوشش کرتے ہیں', surahNumber: 2, ayahNumber: 9 },
    { word: 'مَّرَضٌ', meaningArabic: 'شك ونفاق وفساد في العقيدة', meaningUrdu: 'شک، منافقت اور باطنی بیماری', surahNumber: 2, ayahNumber: 10 },
    { word: 'خَلَوْا۟', meaningArabic: 'انصرفوا واجتمعوا منفردين', meaningUrdu: 'تنہائی میں اپنے سرداروں سے ملتے ہیں', surahNumber: 2, ayahNumber: 14 },
    { word: 'يَمُدُّهُمْ', meaningArabic: 'يملي لهم ويزيدهم في طغيانهم', meaningUrdu: 'ان کی رسی دراز کرتا ہے سرکشی میں', surahNumber: 2, ayahNumber: 15 },
    { word: 'يَعْمَهُونَ', meaningArabic: 'يتحيرون ويترددون في الضلال', meaningUrdu: 'بھٹکتے اور اندھوں کی طرح گھومتے ہیں', surahNumber: 2, ayahNumber: 15 },
  ],
  4: [
    { word: 'ٱسْتَوْقَدَ', meaningArabic: 'أوقد ناراً وأشعلها للإضاءة', meaningUrdu: 'آگ روشن کی اور بھڑکائی', surahNumber: 2, ayahNumber: 17 },
    { word: 'صُمٌّ', meaningArabic: 'فاقدو السمع النافع لا يقبلون الحق', meaningUrdu: 'بہرے (حق سننے سے محروم)', surahNumber: 2, ayahNumber: 18 },
    { word: 'بُكْمٌ', meaningArabic: 'خرس عن النطق بالحق', meaningUrdu: 'گونگے (حق بات بولنے سے عاری)', surahNumber: 2, ayahNumber: 18 },
    { word: 'عُمْىٌ', meaningArabic: 'عمي القلوب عن رؤية الهدى', meaningUrdu: 'اندھے (حق کو دیکھنے سے قاصر)', surahNumber: 2, ayahNumber: 18 },
    { word: 'صَيِّبٍ', meaningArabic: 'مطر شديد ينزل من السماء', meaningUrdu: 'زور دار برستی ہوئی بارش', surahNumber: 2, ayahNumber: 19 },
    { word: 'ٱلصَّوَٰعِقِ', meaningArabic: 'نار تنزل من السماء مع الرعد الشديد', meaningUrdu: 'آسمانی بجلیاں اور کڑک', surahNumber: 2, ayahNumber: 19 },
    { word: 'يَخْطَفُ', meaningArabic: 'يأخذ بسرعة واستلاب لشدة بريقه', meaningUrdu: 'اچک لیتا ہے، اندھا کر دیتا ہے', surahNumber: 2, ayahNumber: 20 },
    { word: 'أَندَاداً', meaningArabic: 'شركاء وأمثالاً تعبدونها مع الله', meaningUrdu: 'بت اور شریک جن کی پوجا کی جائے', surahNumber: 2, ayahNumber: 22 },
  ],
  5: [
    { word: 'أَزْوَٰجٌ مُّطَهَّرَةٌ', meaningArabic: 'منزهات عن كل عيب وأذى ودنس', meaningUrdu: 'ہر قسم کی نجاست اور عیب سے پاک جوڑے', surahNumber: 2, ayahNumber: 25 },
    { word: 'بَعُوضَةً', meaningArabic: 'الحشرة الصغيرة الضعيفة المعروفة', meaningUrdu: 'مچھر (چھوٹا اور کمزور کیڑا)', surahNumber: 2, ayahNumber: 26 },
    { word: 'فَمَا فَوْقَهَا', meaningArabic: 'أكبر منها أو أصغر في الصغر والحقارة', meaningUrdu: 'یا اس سے بھی بڑھ کر کوئی حقیر چیز', surahNumber: 2, ayahNumber: 26 },
    { word: 'ٱلْفَـٰسِقِينَ', meaningArabic: 'الخارجين عن طاعة الله المتمردين', meaningUrdu: 'نافرمان اور سرکش لوگ', surahNumber: 2, ayahNumber: 26 },
    { word: 'مِيثَـٰقَهُ', meaningArabic: 'العهد المؤكد المؤصل في الفطرة والوحي', meaningUrdu: 'اللہ کا پختہ عہد و پیمان', surahNumber: 2, ayahNumber: 27 },
    { word: 'أَمْوَٰتاً', meaningArabic: 'عدماً في أصلاب آبائكم قبل النفخ', meaningUrdu: 'بے جان (وجود میں آنے سے پہلے)', surahNumber: 2, ayahNumber: 28 },
    { word: 'فَسَوَّىٰهُنَّ', meaningArabic: 'خلقهن محكمات مستويات بلا عيب', meaningUrdu: 'ان کو برابر اور درست بنا دیا', surahNumber: 2, ayahNumber: 29 },
  ],
  11: [
    { word: 'لَا ذَلُولٌ', meaningArabic: 'ليست هينة سهلة الانقياد للعمل', meaningUrdu: 'سدھائی ہوئی اور محنت کی عادی نہ ہو', surahNumber: 2, ayahNumber: 71 },
    { word: 'تُثِيرُ ٱلْأَرْضَ', meaningArabic: 'تقلب الأرض بالحراثة للزراعة', meaningUrdu: 'کھیتی کے لیے زمین کو الٹ پلٹ کرے', surahNumber: 2, ayahNumber: 71 },
    { word: 'ٱلْحَرْثَ', meaningArabic: 'الزرع أو الأرض المهيأة له', meaningUrdu: 'کھیت یا زراعت کے لیے تیار زمین', surahNumber: 2, ayahNumber: 71 },
    { word: 'مُسَلَّمَةٌ', meaningArabic: 'مبرأة من العيوب والآفات سلیمة', meaningUrdu: 'ہر قسم کے عیب اور بیماری سے بے داغ', surahNumber: 2, ayahNumber: 71 },
    { word: 'لَّا شِيَةَ فِيهَا', meaningArabic: 'لا لون فيها غير الصفرة الفاقعة', meaningUrdu: 'اس میں زردی کے سوا کوئی دوسرا داغ یا رنگ نہ ہو', surahNumber: 2, ayahNumber: 71 },
    { word: 'فَٱدَّـٰرَٰءْتُمْ فِيهَا', meaningArabic: 'فتدافعتم وتخاصمتم في شأن القتيل', meaningUrdu: 'تم نے ایک دوسرے پر قتل کا الزام ڈالا اور جھگڑے', surahNumber: 2, ayahNumber: 72 },
    { word: 'يَتَفَجَّرُ', meaningArabic: 'يتفتح بسعة وكثرة للماء والعيون', meaningUrdu: 'پھوٹ نکلتے ہیں کثرت سے پانی کے چشمے', surahNumber: 2, ayahNumber: 74 },
    { word: 'يَشَّقَّقُ', meaningArabic: 'يتصدع وينفلق فيخرج منه الماء', meaningUrdu: 'پھٹ جاتا ہے اور اس میں سے پانی نکل آتا ہے', surahNumber: 2, ayahNumber: 74 },
    { word: 'يُحَرِّفُونَهُ', meaningArabic: 'يبدلونه أو يؤولونه بغير معناه بالباطل', meaningUrdu: 'کلام الٰہی کو بدل ڈالتے ہیں اور غلط تاویل کرتے ہیں', surahNumber: 2, ayahNumber: 75 },
    { word: 'خَلَا بَعْضُهُمْ', meaningArabic: 'انفرد ومضى واجتمع برفقائه سراً', meaningUrdu: 'تنہائی میں اپنے ساتھیوں سے ملے', surahNumber: 2, ayahNumber: 76 },
    { word: 'فَتَحَ ٱللَّهُ عَلَيْكُمْ', meaningArabic: 'حكم به أو قصه عليكم في التوراة من نعت النبي', meaningUrdu: 'جو اللہ نے تم پر تورات میں کھولا اور بیان فرمایا', surahNumber: 2, ayahNumber: 76 }
  ]
};

/**
 * Determine the thematic subject for any given Surah and Ayah number
 */
export function getThematicSubjectForAyah(surah: number, ayah: number): ThematicSubject & { titleArabic: string; titleUrdu: string } {
  // Search for the specific matching passage rule
  for (const rule of THEMATIC_PASSAGES) {
    if (rule.surah === surah && ayah >= rule.fromAyah && ayah <= rule.toAyah) {
      const sub = THEMATIC_SUBJECTS[rule.subjectId];
      return {
        ...sub,
        titleArabic: rule.titleArabic,
        titleUrdu: rule.titleUrdu
      };
    }
  }

  // Smart surah-level thematic defaults if not explicitly broken into micro-passages
  let defaultSubjectId: ThematicSubjectId = 'faith_tawheed';
  let titleAr = 'آيات الحكمة والبيان والتوحيد';
  let titleUr = 'حکمت، توحید اور تدبر کی آیات';

  if (surah >= 7 && surah <= 12) {
    defaultSubjectId = 'prophets_stories';
    titleAr = 'قصص الأنبياء وسير الأولين والعبر';
    titleUr = 'انبیائے کرام کے واقعات اور عبرت کے اسباق';
  } else if (surah === 4 || surah === 5 || surah === 24 || surah === 65) {
    defaultSubjectId = 'rulings_shariah';
    titleAr = 'الأحكام الشرعية والفرائض والحدود';
    titleUr = 'شرعی احکام، حلال و حرام اور فرائض کی تفصیل';
  } else if (surah >= 77 && surah <= 104) {
    defaultSubjectId = 'judgement_day';
    titleAr = 'أهوال القيامة والبعث والجزاء والحساب';
    titleUr = 'قیامت کے احوال، نامۂ اعمال اور حساب و کتاب';
  } else if (surah === 55 || surah === 56 || surah === 76) {
    defaultSubjectId = 'believers_paradise';
    titleAr = 'نعيم الجنة وصفات عباد الرحمن والجزاء';
    titleUr = 'اہلِ ایمان کا اجر اور جنت کی دلکش نعمتیں';
  } else if (surah === 63 || surah === 109 || surah === 111) {
    defaultSubjectId = 'hypocrites_hellfire';
    titleAr = 'بيان صفات المنافقين وعذاب النار';
    titleUr = 'منافقین کے کرتوت اور عذابِ جہنم کی وعید';
  }

  const sub = THEMATIC_SUBJECTS[defaultSubjectId];
  return {
    ...sub,
    titleArabic: titleAr,
    titleUrdu: titleUr
  };
}

/**
 * Get marginal vocabulary for a given page number (1 to 604)
 */
export function getMarginalVocabularyForPage(pageNumber: number): MarginalWordMeaning[] {
  if (MARGINAL_VOCABULARY_DATA[pageNumber]) {
    return MARGINAL_VOCABULARY_DATA[pageNumber];
  }
  return [];
}
