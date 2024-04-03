import type { Timing } from './timing';

export type Country = {
  id: number;
  name: string;
};

export type City = {
  id: number;
  name: string;
};

export type Mosque = {
  address: string;
  city: string;
  guidId: string;
  id: number;
  image: string;
  name: string;
  zipCode: string;
};

export type PrayerTiming = {
  start: Timing;
  congregation: Timing;
};

export type DayTimings = {
  fajr: PrayerTiming;
  sunrise: Timing;
  zuhr: PrayerTiming;
  asr: PrayerTiming;
  sunset: PrayerTiming;
  isha: PrayerTiming;
};

export type MasjidDetails = {
  id: number;
  guidId: string;
  name: string;
  house: string;
  street: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  plDisplayName: string;
  slDisplayName: string;
  subHeading: string;
  comments: string;
  city: string;
  country: string;
  image: string;
  imageUrl: string;
  isPublish: boolean;
  organizationId: string | number;
};

export type MasjidSettings = {
  isDstOn: boolean;
  jumahTime: string;
  isTimingsUploaded: boolean;
  showJumahTime: boolean;
  hijriOffset: number;
  jummahTimeEqualsZuhrTime: boolean;
  showTomorrowIqamahTimes: boolean;
  standardIqamahCalculation: boolean;
  showIqamahMinutesasTime: boolean;
  showHijriCalender: boolean;
  displayTimeIn12HourFormat: boolean;
  enableMarkers: boolean;
  playSoundBeforeIqamah: boolean;
  enableMultipleSalahTimings: boolean;
};

export type SalahTiming = {
  fajr: string;
  shouruq: string;
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  day: number;
  month: number;
  iqamah_Fajr: string;
  iqamah_Zuhr: string;
  iqamah_Asr: string;
  iqamah_Maghrib: string;
  iqamah_Isha: string;
};

export type IqamahTimings = {
  fajr: number;
  zuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  jumah: number;
  playSoundBeforeIqamah: boolean;
  showIqamahTime: boolean;
};

export type JumahSalahIqamahTiming = {
  iqamahTimeMinutes: number;
  time: string;
  iqamahTime: string;
  isPrimary: boolean;
};
