let timings = null;
let year = null;
let setIntervalId = null;

const fajrTimingElement = document.getElementById("fajr-timing");
const zuhrTimingElement = document.getElementById("zuhr-timing");
const asrTimingElement = document.getElementById("asr-timing");
const maghribTimingElement = document.getElementById("maghrib-timing");
const ishaTimingElement = document.getElementById("isha-timing");

async function fetchTimings() {
  const id = "ae3cb3a6-066b-42fd-9684-3e10e8a3c118";
  const response = await fetch(`https://time.my-masjid.com/api/TimingsInfoScreen/GetMasjidTimings?GuidId=${id}`);
  timings = await response.json().then(d => d.model.salahTimings);
};

function bind() {
  if (timings == null) {
    return;
  }

  const now = new Date();
  const today = now.getUTCDate();
  const thisMonth = now.getUTCMonth() + 1;
  const thisYear = now.getUTCFullYear();

  if (year != null && year != thisYear) {
    clearInterval(setIntervalId);
    start();
    return;
  }

  year = thisYear;

  const todayTiming = timings.find(t => t.day == today && t.month == thisMonth);

  fajrTimingElement.innerHTML = todayTiming.fajr;
  zuhrTimingElement.innerHTML = todayTiming.zuhr;
  asrTimingElement.innerHTML = todayTiming.asr;
  maghribTimingElement.innerHTML = todayTiming.maghrib;
  ishaTimingElement.innerHTML = todayTiming.isha;
}

function start() {
  fetchTimings().then(bind).then(() => { setIntervalId = setInterval(bind, 1000); });
}

start();
