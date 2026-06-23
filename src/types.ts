export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  ayahCount: number;
  language: string;
}

export interface TrendingReciter {
  id: string;
  surahName: string;
  reciterName: string;
  imageUrl: string;
}
