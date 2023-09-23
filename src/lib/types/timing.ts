export class Timing {
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  constructor(value?: string | Timing | undefined) {
    if (value === undefined) {
      return;
    }

    if (typeof value !== "string") {
      this.hours = value.hours;
      this.minutes = value.minutes;
      this.seconds = value.seconds;

      this.normalize();

      return;
    }

    if (!/^\d+:\d+(:\d+)?$/.test(value)) {
      console.warn(
        `received invalid timing value "${value}"`,
        "stack trace: " + new Error()
      );
    }

    const values = value.split(":");
    this.hours = Number(values[0] ?? 0);
    this.minutes = Number(values[1] ?? 0);
    this.seconds = Number(values[2] ?? 0);

    this.normalize();
  }

  normalize(): Timing {
    // Carry hours fraction
    const hourFraction = this.hours % 1;
    this.minutes += Math.round(60 * hourFraction);
    this.hours -= hourFraction;

    // Carry minutes fraction
    const minuteFraction = this.minutes % 1;
    this.seconds += Math.round(60 * minuteFraction);
    this.minutes -= minuteFraction;

    // Round seconds
    this.seconds = Math.round(this.seconds);

    // Normalize seconds
    while (this.seconds >= 60) {
      this.minutes++;
      this.seconds -= 60;
    }

    while (this.seconds < 0) {
      this.seconds += 60;
      this.minutes--;
    }

    // Normalize minutes
    while (this.minutes >= 60) {
      this.hours++;
      this.minutes -= 60;
    }

    while (this.minutes < 0) {
      this.minutes += 60;
      this.hours--;
    }

    // Normalize hours
    this.hours %= 24;
    while (this.hours < 0) {
      this.hours += 24;
    }

    return this;
  }

  format(withSeconds = false): string {
    this.normalize();

    const values = [this.hours, this.minutes];
    if (withSeconds) values.push(this.seconds);

    return values.map((val) => String(val).padStart(2, "0")).join(":");
  }

  toDate(): Date {
    const date = new Date();

    // If timing has passed, assume timing is for next day
    if (
      this.format(true) < date.toLocaleTimeString(undefined, { hour12: false })
    ) {
      date.setUTCDate(date.getUTCDate() + 1);
    }

    date.setHours(this.hours, this.minutes, this.seconds, 0);
    return date;
  }

  /**
   * Get time in milliseconds until this timing.
   *
   * @returns time in milliseconds
   */
  getTimeUntil(): number {
    return this.toDate().valueOf() - Date.now();
  }
}

/**
 * Given an array of timings, returns the most imminent timing of them
 * i.e. the one that is closest in the future.
 *
 * @param timings timings to choose from
 * @returns the most imminent timing
 */
export function getMostImminentTime(timings: Timing[]): Timing | undefined {
  // Sort elements ascending based on their time
  timings.sort((a, b) => a.toDate().valueOf() - b.toDate().valueOf());

  // Find first item that is in the future
  return timings.find((time) => time.getTimeUntil() > 0);
}
