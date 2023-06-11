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
