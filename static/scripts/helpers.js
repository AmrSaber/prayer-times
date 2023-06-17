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

/**
 * Finds the HTML element with the content representing the nearest time in the future, or return the first element.
 * 
 * @param {[HTMLElement]} timeElements 
 */
function findNext(timeElements) {
  const now = new Date();

  // Ignore any element that is not time, then map rest to include the parsed time
  const elements = timeElements
    .filter(e => /^\d{1,2}:\d{1,2}(?::\d{1,2})?$/.test(e.innerHTML))
    .map(e => ({ element: e, time: parseTime(e.innerHTML) }));

  if (elements.length == 0) {
    return null;
  }

  // Sort elements ascending based on their time
  elements.sort((a, b) => {
    if (a.time.hours == b.time.hours) {
      return a.time.minutes - b.time.minutes;
    }

    return a.time.hours - b.time.hours;
  });

  // Return first element greater than "now"
  for (const e of elements) {
    if (e.time.hours > now.getHours() ||
      (e.time.hours == now.getHours() && e.time.minutes > now.getMinutes())) {
      return e.element;
    }
  }

  // If no element matches, return first one
  return elements[0].element;
};
