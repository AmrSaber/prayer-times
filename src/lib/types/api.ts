export type HijriDate = {
  day: number;
  month: string;
  year: number;
};

export type HijriDateAnchor = {
  hijriDate: HijriDate;
  gregorianDate: string; // ISO-date
};
