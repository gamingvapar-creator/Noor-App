type Language = 'English' | 'Hindi' | 'Urdu' | 'Arabic';

interface TranslationSet {
  welcome: string;
  assalamu_alaikum: string;
  tagline: string;
  search_placeholder: string;
  tab_trending: string;
  tab_surah: string;
  tab_juz: string;
  tab_audio: string;
  tab_bookmarks: string;
  category_all: string;
  category_meccan: string;
  category_medinan: string;
  category_para: string;
  category_ruko: string;
  popular_surahs: string;
  trending_now: string;
  daily_verse: string;
  ayah_of_day: string;
  continue_reading: string;
  last_read: string;
  no_checkpoint: string;
  checkpoint_tip: string;
  nav_home: string;
  nav_ai: string;
  nav_downloads: string;
  nav_me: string;
  profile_title: string;
  profile_desc: string;
  tokens_available: string;
  unlimited_tokens: string;
  buy_tokens: string;
  font_size: string;
  tajweed_colors: string;
  dark_theme: string;
  logout: string;
  reciter: string;
  view_all: string;
  no_downloads: string;
  no_downloads_sub: string;
  loading: string;
}

export const translations: Record<Language, TranslationSet> = {
  English: {
    welcome: "Welcome to Noor AI",
    assalamu_alaikum: "Assalamu Alaikum",
    tagline: "Begin your journey with the Divine Revelation.",
    search_placeholder: "Search Surah, Ayah, Topic...",
    tab_trending: "Trending",
    tab_surah: "Surah",
    tab_juz: "Juz",
    tab_audio: "Audio",
    tab_bookmarks: "Bookmarks",
    category_all: "All",
    category_meccan: "Meccan",
    category_medinan: "Medinan",
    category_para: "Para",
    category_ruko: "Ruku",
    popular_surahs: "Popular Surahs",
    trending_now: "Trending Now",
    daily_verse: "Daily Verse",
    ayah_of_day: "Ayah of the Day",
    continue_reading: "Continue Reading",
    last_read: "Last Read",
    no_checkpoint: "No checkpoints saved yet",
    checkpoint_tip: "Click 'Ruko (Mark read)' while reading any Surah, and it will appear here!",
    nav_home: "Home",
    nav_ai: "Noor AI",
    nav_downloads: "Downloads",
    nav_me: "Me",
    profile_title: "My Account",
    profile_desc: "Aapka personal Quranic portal",
    tokens_available: "Tokens Available",
    unlimited_tokens: "Unlimited AI Access",
    buy_tokens: "Refill Tokens",
    font_size: "Font Size",
    tajweed_colors: "Tajweed Color Settings",
    dark_theme: "Dark Theme",
    logout: "Logout",
    reciter: "Reciter",
    view_all: "View All",
    no_downloads: "No downloaded Surahs",
    no_downloads_sub: "Downloaded recitation files will appear here for offline reading.",
    loading: "Loading..."
  },
  Hindi: {
    welcome: "नूर एआई में आपका स्वागत है",
    assalamu_alaikum: "अस्सलामू अलैकुम",
    tagline: "दिव्य रहस्योद्घाटन के साथ अपनी आध्यात्मिक यात्रा शुरू करें।",
    search_placeholder: "सूरा, आयत, या विषय खोजें...",
    tab_trending: "ट्रेंडिंग",
    tab_surah: "सूरा",
    tab_juz: "पारा (जूज़)",
    tab_audio: "ऑडियो",
    tab_bookmarks: "बुकमार्क",
    category_all: "सभी",
    category_meccan: "मक्की",
    category_medinan: "मदनी",
    category_para: "पारा",
    category_ruko: "रुकू",
    popular_surahs: "लोकप्रिय सूरह",
    trending_now: "अभी ट्रेंडिंग में",
    daily_verse: "दैनिक आयत",
    ayah_of_day: "आज की आयत",
    continue_reading: "पढ़ना जारी रखें",
    last_read: "पिछली बार पढ़ा",
    no_checkpoint: "अभी तक कोई चेकपॉइंट सहेज नहीं गया",
    checkpoint_tip: "सूरा पढ़ते समय 'रुकू' पर क्लिक करें, और वह यहाँ दिखाई देगा!",
    nav_home: "होम",
    nav_ai: "नूर एआई",
    nav_downloads: "डाउनलोड",
    nav_me: "मेरा प्रोफाइल",
    profile_title: "मेरा खाता",
    profile_desc: "आपका व्यक्तिगत कुरानिक पोर्टल",
    tokens_available: "उपलब्ध टोकन",
    unlimited_tokens: "असीमित एआई उपयोग",
    buy_tokens: "टोकन खरीदें",
    font_size: "अक्षर का आकार (फ़ॉन्ट)",
    tajweed_colors: "तजवीद रंग सेटिंग",
    dark_theme: "डार्क थीम",
    logout: "लॉगआउट",
    reciter: "कारी",
    view_all: "सभी देखें",
    no_downloads: "कोई डाउनलोड किया हुआ सूरह नहीं है",
    no_downloads_sub: "ऑफ़लाइन सुनने के लिए डाउनलोड की गई सूरा यहाँ दिखाई देंगी।",
    loading: "लोड हो रहा है..."
  },
  Urdu: {
    welcome: "نور اے آئی میں خوش آمدید",
    assalamu_alaikum: "السلام علیکم",
    tagline: "الٰہی وحی کے ساتھ اپنے سفر کا آغاز کریں۔",
    search_placeholder: "سورہ، آیت، یا موضوع تلاش کریں...",
    tab_trending: "ٹرینڈنگ",
    tab_surah: "سورہ",
    tab_juz: "پارہ",
    tab_audio: "آڈیو",
    tab_bookmarks: "بک مارکس",
    category_all: "سب",
    category_meccan: "مکی",
    category_medinan: "مدنی",
    category_para: "پارہ",
    category_ruko: "رکوع",
    popular_surahs: "مقبول سورتیں",
    trending_now: "ابھی مقبول",
    daily_verse: "آج کی آیت",
    ayah_of_day: "آج کی منتخب آیت",
    continue_reading: "پڑھنا جاری رکھیں",
    last_read: "آخری بار پڑھا گیا",
    no_checkpoint: "ابھی تک کوئی چیک پوائنٹ محفوظ نہیں کیا گیا",
    checkpoint_tip: "سورہ پڑھتے وقت 'رکوع (محفوظ کریں)' پر کلک کریں، اور وہ یہاں ظاہر ہوگا!",
    nav_home: "ہوم",
    nav_ai: "نور اے آئی",
    nav_downloads: "ڈاؤن لوڈز",
    nav_me: "پروفائل",
    profile_title: "میرا اکاؤنٹ",
    profile_desc: "آپ کا ذاتی قرآنی پورٹل",
    tokens_available: "دستیاب ٹوکنز",
    unlimited_tokens: "لامحدود اے آئی رسائی",
    buy_tokens: "ٹوکن دوبارہ بھریں",
    font_size: "فونٹ سائز",
    tajweed_colors: "تجوید کے رنگوں کی ترتیبات",
    dark_theme: "ڈارک تھیم",
    logout: "لاگ آؤٹ",
    reciter: "قاری",
    view_all: "سب دیکھیں",
    no_downloads: "کوئی ڈاؤن لوڈ کی گئی سورہ نہیں ہے",
    no_downloads_sub: "آف لائن تلاوت سننے کے لیے ڈاؤن لوڈ کردہ فائلیں یہاں دکھائی دیں گی۔",
    loading: "لوڈ ہو رہا ہے..."
  },
  Arabic: {
    welcome: "مرحباً بكم في نور آي",
    assalamu_alaikum: "السلام عليكم",
    tagline: "ابدأ رحلتك الروحانية مع الوحي الإلهي.",
    search_placeholder: "ابحث عن سورة، آية، أو موضوع...",
    tab_trending: "شائع",
    tab_surah: "سورة",
    tab_juz: "جزء",
    tab_audio: "صوتيات",
    tab_bookmarks: "العلامات",
    category_all: "الكل",
    category_meccan: "مكية",
    category_medinan: "مدنية",
    category_para: "جزء",
    category_ruko: "ركوع",
    popular_surahs: "سور شائعة",
    trending_now: "شائع الآن",
    daily_verse: "الآية اليومية",
    ayah_of_day: "آية اليوم",
    continue_reading: "مواصلة القراءة",
    last_read: "آخر قراءة",
    no_checkpoint: "لم يتم حفظ أي نقطة قراءة بعد",
    checkpoint_tip: "اضغط على 'ركوع (علامة قراءة)' أثناء قراءة السورة وستظهر هنا!",
    nav_home: "الرئيسية",
    nav_ai: "نور آي",
    nav_downloads: "التحميلات",
    nav_me: "حسابي",
    profile_title: "ملفي الشخصي",
    profile_desc: "بوابتك القرآنية الخاصة",
    tokens_available: "الرموز المتاحة",
    unlimited_tokens: "وصول غير محدود لـ AI",
    buy_tokens: "شحن الرموز",
    font_size: "حجم الخط",
    tajweed_colors: "إعدادات ألوان التجويد",
    dark_theme: "المظهر الداكن",
    logout: "تسجيل الخروج",
    reciter: "قارئ",
    view_all: "عرض الكل",
    no_downloads: "لا توجد سور محملة",
    no_downloads_sub: "الملفات الصوتية المحملة ستظهر هنا للاستماع بدون إنترنت.",
    loading: "جاري التحميل..."
  }
};

export type { Language };
