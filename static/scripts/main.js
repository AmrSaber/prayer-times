let mosque;
const FRIDAY_INDEX = 5;

const mosqueNameElement = document.getElementById("mosque-name");
const noonLabelElement = document.querySelector('label.noon');

const fajrTimingElement = document.getElementById("fajr-timing");
const zuhrTimingElement = document.getElementById("zuhr-timing");
const asrTimingElement = document.getElementById("asr-timing");
const maghribTimingElement = document.getElementById("maghrib-timing");
const ishaTimingElement = document.getElementById("isha-timing");

const fajrIqamahElement = document.getElementById("fajr-iqamah");
const zuhrIqamahElement = document.getElementById("zuhr-iqamah");
const asrIqamahElement = document.getElementById("asr-iqamah");
const maghribIqamahElement = document.getElementById("maghrib-iqamah");
const ishaIqamahElement = document.getElementById("isha-iqamah");

const sunriseTimingElement = document.getElementById("sunrise-timing");
const midnightTimingElement = document.getElementById("midnight-timing");

const timerSection = document.getElementById('prayer-timer');
const nextPrayer = document.getElementById("next-prayer");
const timeUntilNextPrayer = document.getElementById('time-until-next-prayer');

async function getTimings() {
  const year = new Date().getUTCFullYear();
  const localStorageKey = `timings::${year}::${mosque.id}`;

  // If timings are saved in local storage, return them directly
  const savedTimings = localStorage.getItem(localStorageKey);
  if (savedTimings != null) {
    return JSON.parse(savedTimings);
  }

  // If timings are not in local storage, fetch them, save them in local storage, and return them
  const timings = await fetchTimings({ mosqueId: mosque.id });
  localStorage.setItem(localStorageKey, JSON.stringify(timings));

  return timings;
};

function bind(timings) {
  const now = new Date();
  const today = now.getUTCDate();
  const thisMonth = now.getUTCMonth() + 1;

  const todayTiming = timings.salahTimings.find(t => t.day == today && t.month == thisMonth);

  updateInnerHtml(mosqueNameElement, mosque.name);

  updateInnerHtml(fajrTimingElement, todayTiming.fajr);
  updateInnerHtml(zuhrTimingElement, todayTiming.zuhr);
  updateInnerHtml(asrTimingElement, todayTiming.asr);
  updateInnerHtml(maghribTimingElement, todayTiming.maghrib);
  updateInnerHtml(ishaTimingElement, todayTiming.isha);

  updateInnerHtml(fajrIqamahElement, todayTiming.iqamah_Fajr);
  updateInnerHtml(zuhrIqamahElement, todayTiming.iqamah_Zuhr);
  updateInnerHtml(asrIqamahElement, todayTiming.iqamah_Asr);
  updateInnerHtml(maghribIqamahElement, todayTiming.iqamah_Maghrib);
  updateInnerHtml(ishaIqamahElement, todayTiming.iqamah_Isha);

  updateInnerHtml(sunriseTimingElement, todayTiming.shouruq);
  updateInnerHtml(midnightTimingElement, getMidnightTime(todayTiming));

  if (now.getDay() == FRIDAY_INDEX) {
    updateInnerHtml(noonLabelElement, "الجمعة");
    updateInnerHtml(zuhrIqamahElement, "-");
  } else {
    updateInnerHtml(noonLabelElement, "الظهر");
  }

  // Mark the next prayer time
  {
    const nextTiming = findNext([
      fajrTimingElement,
      sunriseTimingElement,
      zuhrTimingElement,
      asrTimingElement,
      maghribTimingElement,
      ishaTimingElement,
      midnightTimingElement,
    ]);

    if (!nextTiming.classList.contains('next')) {
      // remove "next" from the other timing
      const currentNext = document.querySelector('.next.timing');
      if (currentNext != null) {
        currentNext.classList.remove('next');
      }

      nextTiming.classList.add('next');

      // Set next prayer label
      nextPrayer.innerHTML = document.querySelector('label:has(+ .next)').innerHTML;
    }

    // Update timer
    updateTimer(parseTime(nextTiming.innerHTML));
  }

  // Mark next iqamah time
  {
    const nextIqamah = findNext([
      fajrIqamahElement,
      zuhrIqamahElement,
      asrIqamahElement,
      maghribIqamahElement,
      ishaIqamahElement,
    ]);

    if (!nextIqamah.classList.contains('next')) {
      // remove "next" from the other iqamah
      const currentNext = document.querySelector('.next.iqamah');
      if (currentNext != null) {
        currentNext.classList.remove('next');
      }

      nextIqamah.classList.add('next');
    }
  }
}

function updateTimer(nextPrayerTime) {
  if (nextPrayerTime == null) { return; }

  const now = new Date();
  let hoursDiff = nextPrayerTime.hours - now.getHours();
  let minutesDiff = nextPrayerTime.minutes - now.getMinutes();
  let secondsDiff = 0 - now.getSeconds();

  while (secondsDiff < 0) {
    minutesDiff--;
    secondsDiff += 60;
  }

  while (minutesDiff < 0) {
    hoursDiff--;
    minutesDiff += 60;
  }

  while (hoursDiff < 0) {
    hoursDiff += 24;
  }

  if (hoursDiff == 0 && minutesDiff <= 5) {
    timeUntilNextPrayer.classList.add('danger');
  } else {
    timeUntilNextPrayer.classList.remove('danger');
  }

  const hours = String(hoursDiff).padStart(2, 0);
  const minutes = String(minutesDiff).padStart(2, 0);
  const seconds = String(secondsDiff).padStart(2, 0);

  const remainingTime = `${hours}:${minutes}:${seconds}`;
  updateInnerHtml(timeUntilNextPrayer, remainingTime);

  timerSection.classList.remove('invisible');
}

mosque = localStorage.getItem("mosque");
if (mosque == null) {
  window.location.replace("/select-mosque");
} else {
  mosque = JSON.parse(mosque);

  getTimings()
    .then(bind)
    .then(() => setInterval(() => getTimings().then(bind), 500));
}
