const BASE_URL = "https://time.my-masjid.com/api";

const UK_ID = "53";
const CAMBRIDGE_ID = "20245";

async function fetchTimings({ mosqueId }) {
  const response = await fetch(`${BASE_URL}/TimingsInfoScreen/GetMasjidTimings?GuidId=${mosqueId}`);
  return await response.json().then(d => d.model);
}

async function fetchMosques() {
  const response = await fetch(
    `${BASE_URL}/Masjid/SearchMasjidByLocation?CountryId=${UK_ID}&CityId=${CAMBRIDGE_ID}`,
    { headers: { "Content-Type": "application/json" } },
  );

  return await response.json().then(d => d.model);
}