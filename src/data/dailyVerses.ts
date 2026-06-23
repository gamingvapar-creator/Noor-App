export interface DailyVerseItem {
  id: number;
  surahId: number;
  surahName: string;
  verseNum: string;
  arabic: string;
  english: string;
  hindi: string;
  urdu: string;
  benefitEnglish: string;
  benefitUrdu: string;
}

export const dailyVerses: DailyVerseItem[] = [
  {
    id: 1,
    surahId: 1,
    surahName: "Al-Faatiha",
    verseNum: "1:2-4",
    arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ ۝ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ۝ مَـٰلِكِ يَوْمِ ٱل dِّ ينِ",
    english: "[All] praise is [due] to Allah, Lord of the worlds - The Entirely Merciful, the Especially Merciful, Sovereign of the Day of Recompense.",
    hindi: "सब तरह की तारीफ़ अल्लाह ही के लिए है जो तमाम जहानों का पालने वाला है, बड़ा मेहरबान, निहायत रहम वाला, इंसाफ़ के दिन का मालिक है।",
    urdu: "سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا رب ہے، نہایت مہربان، بہت رحم والا، روزِ جزا کا مالک ہے۔",
    benefitEnglish: "Reciting Surah Al-Fatihah acts as a cure (Shifa) for physical and mental illnesses and invokes Allah's mercy.",
    benefitUrdu: "سورہ فاتحہ ہر بیماری سے شفا اور دلی سکون حاصل کرنے کے لیے ایک لاجواب دعا ہے۔"
  },
  {
    id: 2,
    surahId: 2,
    surahName: "Al-Baqarah",
    verseNum: "2:255",
    arabic: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ",
    english: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep.",
    hindi: "अल्लाह ही वह है जिसके सिवा कोई माबूद नहीं, जो हमेशा ज़िन्दा और सबका निगहबान है; उसे न ऊंघ आती है और न नींद।",
    urdu: "اللہ، اس کے سوا کوئی معبود نہیں، وہ ہمیشہ زندہ رہنے والا اور کائنات کو قائم رکھنے والا ہے، اسے نہ اونگھ آتی ہے نہ نیند۔",
    benefitEnglish: "Ayat-ul-Kursi is the greatest verse of the Quran. Reciting it provides complete protection from evil energies.",
    benefitUrdu: "آیت الکرسی قرآن کی سب سے عظیم ترین آیت ہے جس کے پڑھنے سے انسان شیطان اور آفات سے محفوظ رہتا ہے۔"
  },
  {
    id: 3,
    surahId: 94,
    surahName: "Ash-Sharh",
    verseNum: "94:5-6",
    arabic: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    english: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.",
    hindi: "बेशक हर मुश्किल के साथ आसानी है। बेशक हर मुश्किल के साथ आसानी है।",
    urdu: "بلاشبہ ہر تنگی کے ساتھ آسانی ہے۔ بے شک ہر تنگی کے ساتھ آسانی ہے۔",
    benefitEnglish: "Recitation brings immense relief to an anxious heart and encourages faith during testing times.",
    benefitUrdu: "مشکلات اور پریشانیوں کے دور میں دل کو تسلی دینے اور سکون پہنچانے والی آیت ہے۔"
  },
  {
    id: 4,
    surahId: 3,
    surahName: "Al-Imran",
    verseNum: "3:173",
    arabic: "حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ",
    english: "Sufficient for us is Allah, and [He is] the best Disposer of affairs.",
    hindi: "अल्लाह हमारे लिए काफ़ी है और वह बेहतरीन कारसाज़ है।",
    urdu: "ہمیں اللہ ہی کافی ہے اور وہ بہترین کارساز ہے۔",
    benefitEnglish: "A powerful declaration of Tawakkul (trust in Allah) to overcome worries, fear, and anxieties.",
    benefitUrdu: "توکل اور ایمان کا عظیم ترین فقرہ جو ہر خوف اور گھبراہٹ کا علاج ہے۔"
  },
  {
    id: 5,
    surahId: 21,
    surahName: "Al-Anbiya",
    verseNum: "21:87",
    arabic: "لَّآ إِلَـٰهَ إِلَّآ أَنتَ سُبْحَـٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّـٰلِمِينَ",
    english: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    hindi: "तेरे सिवा कोई माबूद नहीं, तू पाक है, बेशक मैं ही क़सूरवारों में से था।",
    urdu: "تیرے سوا کوئی معبود نہیں، تو پاک ہے، بیشک میں ہی گنہگاروں میں سے تھا۔",
    benefitEnglish: "The prayer of Prophet Yunus (Aayat-e-Karima) for instant relief from distress and acceptance of supplications.",
    benefitUrdu: "آیت کریمہ (دعاۓ حضرت یونس) جو ہر غم اور بڑی سے بڑی پریشانی سے نجات کا آزمودہ ذریعہ ہے۔"
  },
  {
    id: 6,
    surahId: 14,
    surahName: "Ibrahim",
    verseNum: "14:7",
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    english: "If you are grateful, I will surely increase you [in favor].",
    hindi: "अगर तुम शुक्रगुज़ार बनोगे, तो मैं तुम्हें और ज़्यादा अता करूँगा।",
    urdu: "اگر تم شکر کرو گے تو میں تمہیں یقیناً اور زیادہ دوں گا۔",
    benefitEnglish: "Gratitude unlocks abundant blessings and ensures the preservation of existing favors from Allah.",
    benefitUrdu: "شکر گزاری کی فضیلت، جتنا اللہ کا شکر ادا کریں گے نعمتیں اتنی زیادہ بڑھتی جائیں گی۔"
  },
  {
    id: 7,
    surahId: 2,
    surahName: "Al-Baqarah",
    verseNum: "2:152",
    arabic: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُواْ لِى وَلَا تَكْفُرُونِ",
    english: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    hindi: "लिहाज़ा तुम मुझे याद रखो, मैं तुम्हें याद रखूँगा, और मेरा शुक्र अदा करते रहो और मेरी नाशुक्रगुज़ारी न करो।",
    urdu: "پس تم مجھے یاد کرو، میں تمہیں یاد کروں گا، اور میرا شکر ادا کرو اور میری ناشکری نہ کرو۔",
    benefitEnglish: "Establishes a direct connection with the Creator. Remembering Allah brings supreme peace and safety.",
    benefitUrdu: "اللہ تبارک و تعالیٰ کا قرب حاصل کرنے اور دل کو اطمینان بخشنے کا بہترین نسخہ۔"
  },
  {
    id: 8,
    surahId: 25,
    surahName: "Al-Furqan",
    verseNum: "25:74",
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍۢ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    english: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.",
    hindi: "ए हमारे रब! हमें हमारी पत्नियों और बच्चों से आँखों की ठंडक अता कर और हमें परहेज़गारों का इमाम बना।",
    urdu: "اے ہمارے رب! ہمیں ہماری بیویوں اور بچوں سے آنکھوں کی ٹھنڈک عطا فرما اور ہمیں پرہیزگاروں کا پیشوا بنا۔",
    benefitEnglish: "A beautiful prayer to safeguard family ties and raise righteous and respectful progeny.",
    benefitUrdu: "نیک بیوی اور نیک اولاد کے لیے قرآنی دعا جو گھرانوں میں خوشی اور برکت لاتی ہے۔"
  },
  {
    id: 9,
    surahId: 65,
    surahName: "At-Talaq",
    verseNum: "65:2-3",
    arabic: "وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًۭا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    english: "And whoever fears Allah - He will make for him a way out, and will provide for him from where he does not expect.",
    hindi: "और जो अल्लाह से डरेगा, अल्लाह उसके लिए मुश्किल से निकलने का रास्ता बना देगा, और उसे वहाँ से रिज़्क़ देगा जहाँ से गुमान भी न हो।",
    urdu: "اور جو کوئی اللہ سے ڈرے گا، وہ اس کے لیے نکلنے کا راستہ بنا دے گا اور اسے وہاں سے رزق دے گا جہاں سے گمان بھی نہ ہوگا۔",
    benefitEnglish: "Taqwa (piety) ensures divine solution for any financial crisis and resolves impossible tight paths.",
    benefitUrdu: "تقوی اور پرہیزگاری اختیار کرنے والوں کے لیے رزق کی بے پناہ فراخی اور معاشی تنگی کا مستقل حل۔"
  },
  {
    id: 10,
    surahId: 40,
    surahName: "Ghafir",
    verseNum: "40:60",
    arabic: "ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ",
    english: "Call upon Me; I will respond to you.",
    hindi: "तुम मुझे पुकारो, मैं तुम्हारी दुआ क़बूल करूँगा।",
    urdu: "تم مجھ سے دعا مانگو، میں تمہاری دعا قبول کروں گا۔",
    benefitEnglish: "A direct divine invitation from Allah ensuring that every sincere call is heard and answered.",
    benefitUrdu: "دعا کی قبولیت کی الٰہی ضمانت اور مایوسی سے نکلنے کا صراطِ مستقیم۔"
  }
];
