import { TajweedRule } from '../types/quran';

export const TAJWEED_RULES: TajweedRule[] = [
  {
    nameUrdu: 'تفخیم (حروفِ مستعلیہ)',
    nameEnglish: 'Tafkheem / Heavy Letters',
    colorName: 'Green',
    colorHex: '#16a34a',
    descriptionUrdu: 'حروف کو پر (موٹا) کر کے پڑھنا (خ، ص، ض، ط، ظ، غ، ق)۔',
    descriptionEnglish: 'To pronounce letters with a heavy/elevated mouth shape (Kha, Sad, Dad, Ta, Za, Ghayn, Qaf).',
    examples: ['خَالِدِينَ', 'الصِّرَاطَ', 'الظَّالِمِينَ']
  },
  {
    nameUrdu: 'قلقلہ (جنبش / ہلا کر پڑھنا)',
    nameEnglish: 'Qalqalah / Echoing Sound',
    colorName: 'Cyan / Blue',
    colorHex: '#0284c7',
    descriptionUrdu: 'ساکن حرف کو ہلا کر پڑھنا تاکہ آواز میں گونج پیدا ہو (ق، ط، ب، ج، د)۔',
    descriptionEnglish: 'To produce an echoing, rebounding sound when these letters are sukoon (Qaf, Taa, Baa, Jeem, Daal).',
    examples: ['الْفَلَقِ', 'مُحِيطٌ', 'وَتَبَّ']
  },
  {
    nameUrdu: 'غنہ و مد (لمبا کرنا)',
    nameEnglish: 'Ghunnah & Madd',
    colorName: 'Pink / Red',
    colorHex: '#e11d48',
    descriptionUrdu: 'نون یا میم مشدد پر ناک سے آواز نکالنا (غنہ)، یا الف، واؤ، یاء پر مد کو دراز کرنا۔',
    descriptionEnglish: 'Nasalization on Noon/Meem with Shaddah (Ghunnah) or elongation of Madd letters (2 to 6 harakat).',
    examples: ['إِنَّ', 'ثُمَّ', 'الضَّالِّينَ']
  },
  {
    nameUrdu: 'ادغام (حروف کو ملانا)',
    nameEnglish: 'Idgham / Assimilation',
    colorName: 'Orange',
    colorHex: '#ea580c',
    descriptionUrdu: 'شد کے ذریعے دو حروف کو آپس میں مدغم کرنا (ملانا)۔',
    descriptionEnglish: 'To merge a sakin letter into the following vowelled letter, pronouncing as a doubled letter.',
    examples: ['مَنْ يَقُولُ', 'مِنْ وَالٍ', 'مِنْ رَبِّهِمْ']
  },
  {
    nameUrdu: 'عام حروف (اصل تلفظ)',
    nameEnglish: 'Normal / Primary Pronunciation',
    colorName: 'Black / Slate',
    colorHex: '#1e293b',
    descriptionUrdu: 'عام روایتی عربی تلفظ بغیر کسی اضافی تجویدی کھنچاؤ کے۔',
    descriptionEnglish: 'Standard natural articulation of consonants and vowels according to classical Arabic makharij.',
    examples: ['بِسْمِ', 'الْحَمْدُ', 'الْعَالَمِينَ']
  }
];
