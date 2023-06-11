const mosqueId = "ae3cb3a6-066b-42fd-9684-3e10e8a3c118";

const fajrTimingElement = document.getElementById("fajr-timing");
const zuhrTimingElement = document.getElementById("zuhr-timing");
const asrTimingElement = document.getElementById("asr-timing");
const maghribTimingElement = document.getElementById("maghrib-timing");
const ishaTimingElement = document.getElementById("isha-timing");

async function getTimings() {
  const year = new Date().getUTCFullYear();
  const localStorageKey = `${mosqueId}::${year}`;

  // If timings are saved in local storage, return them directly
  const savedTimings = localStorage.getItem(localStorageKey);
  if (savedTimings != null) {
    return JSON.parse(savedTimings);
  }

  // If timings are not in local storage, fetch them, save them in local storage, and return them
  const response = await fetch(`https://time.my-masjid.com/api/TimingsInfoScreen/GetMasjidTimings?GuidId=${mosqueId}`);
  const timings = await response.json().then(d => d.model.salahTimings);

  localStorage.setItem(localStorageKey, JSON.stringify(timings));
  return timings;
};

function bind(timings) {
  const now = new Date();
  const today = now.getUTCDate();
  const thisMonth = now.getUTCMonth() + 1;

  const todayTiming = timings.find(t => t.day == today && t.month == thisMonth);

  fajrTimingElement.innerHTML = todayTiming.fajr;
  zuhrTimingElement.innerHTML = todayTiming.zuhr;
  asrTimingElement.innerHTML = todayTiming.asr;
  maghribTimingElement.innerHTML = todayTiming.maghrib;
  ishaTimingElement.innerHTML = todayTiming.isha;
}

getTimings()
  .then(bind)
  .then(() => {
    setInterval(
      getTimings().then(bind),
      60_000
    );
  });
