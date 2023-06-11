let mosque;
const FRIDAY_INDEX = 5;

const mosqueNameElement = document.getElementById("mosque-name");

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

const fridayTimingElement = document.getElementById("friday-timing");
const sunriseTimingElement = document.getElementById("sunrise-timing");
const midnightTimingElement = document.getElementById("midnight-timing");

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

  mosqueNameElement.innerHTML = mosque.name;

  fajrTimingElement.innerHTML = todayTiming.fajr;
  zuhrTimingElement.innerHTML = todayTiming.zuhr;
  asrTimingElement.innerHTML = todayTiming.asr;
  maghribTimingElement.innerHTML = todayTiming.maghrib;
  ishaTimingElement.innerHTML = todayTiming.isha;

  fajrIqamahElement.innerHTML = todayTiming.iqamah_Fajr;
  zuhrIqamahElement.innerHTML = todayTiming.iqamah_Zuhr;
  asrIqamahElement.innerHTML = todayTiming.iqamah_Asr;
  maghribIqamahElement.innerHTML = todayTiming.iqamah_Maghrib;
  ishaIqamahElement.innerHTML = todayTiming.iqamah_Isha;

  fridayTimingElement.innerHTML = timings.masjidSettings.jumahTime;
  sunriseTimingElement.innerHTML = todayTiming.shouruq;
  midnightTimingElement.innerHTML = getMidnightTime(todayTiming);

  if (now.getDay() == FRIDAY_INDEX) {
    document.querySelectorAll('.friday-only.hide').forEach(e => {
      e.classList.remove("hide");
      e.classList.add("show");
    });

    zuhrIqamahElement.innerHTML = "-";
  } else {
    document.querySelectorAll('.friday-only.show').forEach(e => {
      e.classList.remove("show");
      e.classList.add("hide");
    });
  }

  // Mark the next prayer time
  markNextElement([
    fajrTimingElement,
    sunriseTimingElement,
    zuhrTimingElement,
    asrTimingElement,
    maghribTimingElement,
    ishaTimingElement,
    midnightTimingElement,
  ]);

  // Mark next iqamah time
  markNextElement([
    fajrIqamahElement,
    zuhrIqamahElement,
    asrIqamahElement,
    maghribIqamahElement,
    ishaIqamahElement,
  ]);
}

function markNextElement(elements) {
  const now = new Date();
  const currentNext = elements.findIndex(e => e.classList.contains("next"));

  const elementsWithTime = elements
    .filter(e => e.innerHTML != "-")
    .map(e => ({ element: e, time: parseTime(e.innerHTML) }));

  let nextIndex = -1;
  for (let i = 0; i < elementsWithTime.length; i++) {
    const prayer = elementsWithTime[i];

    if (prayer.time.hours > now.getHours() ||
      (prayer.time.hours == now.getHours() && prayer.time.minutes > now.getMinutes())) {
      nextIndex = i;
      break;
    }
  }

  if (nextIndex == -1) {
    nextIndex = 0;
  }

  if (currentNext != nextIndex) {
    if (currentNext != -1) { elementsWithTime[currentNext].element.classList.remove("next"); }
    elementsWithTime[nextIndex].element.classList.add("next");
  }
}

mosque = localStorage.getItem("mosque");
if (mosque == null) {
  window.location.replace("/select-mosque");
} else {
  mosque = JSON.parse(mosque);

  getTimings()
    .then(bind)
    .then(() => {
      setInterval(
        () => getTimings().then(bind),
        60_000
      );
    });
}
