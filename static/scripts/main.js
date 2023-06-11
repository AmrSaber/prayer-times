let mosque;

const mosqueNameElement = document.getElementById("mosque-name");
const fajrTimingElement = document.getElementById("fajr-timing");
const zuhrTimingElement = document.getElementById("zuhr-timing");
const asrTimingElement = document.getElementById("asr-timing");
const maghribTimingElement = document.getElementById("maghrib-timing");
const ishaTimingElement = document.getElementById("isha-timing");

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

  const todayTiming = timings.find(t => t.day == today && t.month == thisMonth);

  mosqueNameElement.innerHTML = mosque.name;

  fajrTimingElement.innerHTML = todayTiming.fajr;
  zuhrTimingElement.innerHTML = todayTiming.zuhr;
  asrTimingElement.innerHTML = todayTiming.asr;
  maghribTimingElement.innerHTML = todayTiming.maghrib;
  ishaTimingElement.innerHTML = todayTiming.isha;
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
        getTimings().then(bind),
        60_000
      );
    });
}
