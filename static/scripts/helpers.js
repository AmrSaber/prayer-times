function getMidnightTime(timing) {
  const sunset = parseTime(timing.maghrib);
  const fajr = parseTime(timing.fajr);

  let minutes = (sunset.minutes + fajr.hours) / 2;
  minutes -= minutes % 1;

  let hours = (sunset.hours + fajr.hours + 24) / 2;
  const hoursFraction = hours % 1;

  // The only possible fraction is 0.5 because of division by 2
  if (hoursFraction != 0) {
    minutes += 30;
    hours -= hoursFraction;
  }

  while (minutes >= 60) {
    hours++;
    minutes -= 60;
  }

  while (hours >= 24) {
    hours -= 24;
  }

  return `${String(hours).padStart(2, 0)}:${String(minutes).padStart(2, 0)}`;
}

function parseTime(time) {
  if (!/\d{1,2}:\d{1,2}/.test(time)) { return null; }
  let [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
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

/**
 * Update element's inner html if it's different from the provided text
 * 
 * @param {HTMLElement} element 
 * @param {String} text 
 */
function updateInnerHtml(element, text) {
  if (element.innerHTML != text) {
    element.innerHTML = text;
  }
}