import { Timing, isValidTiming } from "./types";

export function getImminentElement(querySelector: string): Element | undefined {
  const prayerTimings = [...document.querySelectorAll(querySelector)];
  const sortedTimings = prayerTimings
    .filter(e => isValidTiming(e.innerHTML))
    .map((e) => ({
      element: e,
      timeUntil: new Timing(e.innerHTML).getTimeUntil(),
    }))
    .sort((a, b) => a.timeUntil - b.timeUntil);

  return sortedTimings.find((val) => val.timeUntil > 0)?.element;
}

export function markImminentElement(
  querySelector: string
): Element | undefined {
  const imminentElement = getImminentElement(querySelector);
  const oldImminentElement = document.querySelector(`${querySelector}.next`);

  if (oldImminentElement != imminentElement) {
    oldImminentElement?.classList.remove("next");
    imminentElement?.classList.add("next");
  }

  return imminentElement;
}
