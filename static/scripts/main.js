let mosque;

const mosqueNameElement = document.getElementById("mosque-name");

const fajrTimingElement = document.getElementById("fajr-timing");
const zuhrTimingElement = document.getElementById("zuhr-timing");
const asrTimingElement = document.getElementById("asr-timing");
const maghribTimingElement = document.getElementById("maghrib-timing");
const ishaTimingElement = document.getElementById("isha-timing");

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

  sunriseTimingElement.innerHTML = todayTiming.shouruq;
  midnightTimingElement.innerHTML = getMidnightTime(todayTiming);

  // Mark the next prayer time
  const prayers = [
    { element: fajrTimingElement, time: parseTime(fajrTimingElement.innerHTML) },
    { element: zuhrTimingElement, time: parseTime(zuhrTimingElement.innerHTML) },
    { element: asrTimingElement, time: parseTime(asrTimingElement.innerHTML) },
    { element: maghribTimingElement, time: parseTime(maghribTimingElement.innerHTML) },
    { element: ishaTimingElement, time: parseTime(ishaTimingElement.innerHTML) },
  ];

  const currentNext = prayers.findIndex(p => p.element.classList.contains("next"));

  let nextIndex = -1;
  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i];

    if (prayer.time.hours > now.getHours() && prayer.time.minutes > now.getMinutes()) {
      nextIndex = i;
      break;
    }
  }

  if (nextIndex == -1) {
    nextIndex = 0;
  }

  if (currentNext != nextIndex) {
    if (currentNext != -1) { prayers[currentNext].element.classList.remove("next"); }
    prayers[nextIndex].element.classList.add("next");
  }
}

function getMidnightTime(timing) {
  const sunset = parseTime(timing.maghrib);
  const fajr = parseTime(timing.fajr);

  let midnightMinutes = (sunset.minutes + fajr.hours) / 2;
  midnightMinutes -= midnightMinutes % 1;

  let midnightHour = (sunset.hours + fajr.hours + 24) / 2;
  const hourFraction = midnightHour % 1;

  if (hourFraction != 0) {
    midnightMinutes += 30;
    midnightHour -= hourFraction;
  }

  while (midnightMinutes > 60) {
    midnightHour++;
    midnightMinutes -= 60;
  }

  return `${midnightHour}:${midnightMinutes}`;
}

function parseTime(time) {
  const [hours, minutes] = time.split(':');
  return { hours: Number(hours), minutes: Number(minutes) };
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
