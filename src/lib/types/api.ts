export type HijriDate = {
  day: number;
  month: string;
  year: number;
};

export type HijriDateAnchor = {
  hijriDate: HijriDate;
  gregorianDate: string; // ISO-date
};

// Normalized timings contract between the server and the client. Times are "HH:MM" strings.
export type PrayerTimes = {
  start: string;
  congregation?: string;
};

export type Day = {
  date: string; // YYYY-MM-DD
  fajr: PrayerTimes;
  sunrise: string;
  zuhr: PrayerTimes;
  asr: PrayerTimes;
  maghrib: PrayerTimes;
  isha: PrayerTimes;
  jumah?: string;
};

export type Selection = {
  country: number;
  city: number;
  mosque?: string | null;
};

export type Location = {
  title: string;
  subtitle: string;
  titleAr?: string;
  subtitleAr?: string;
};

export type Source = {
  name: string;
  nameAr?: string;
  url: string;
};

export type TimingsResponse = {
  location: Location;
  source: Source;
  /** True when the preferred source failed and another one answered instead. */
  fallback?: boolean;
  day: Day;
};

export type MosqueOption = {
  id: string;
  name: string;
};
