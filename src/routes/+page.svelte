<script lang="ts">
  import { onMount } from 'svelte';
  import { getHijriDate, getTimings } from '$lib/services';
  import {
    lastTimings,
    selectedCity,
    selectedCountry,
    selectedLanguage,
    selectedMosqueId,
    selectionKey,
    showTimerSeconds,
  } from '$lib/stores';
  import { Timing, type HijriDate } from '$lib/types';
  import type { DayTimings } from '$lib/types/pure';
  import type { Day } from '$lib/types';
  import { getFirstThirdOfNight, getLastThirdOfNight, getMidnight } from '$lib/utils';
  import { fade } from 'svelte/transition';
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import Title from '$lib/components/Title.svelte';
  import { EGYPT_ID, UK_ID } from '$lib/constants';
  import ChangeMosque from '$lib/components/ChangeMosque.svelte';

  type PrayerKey = 'fajr' | 'zuhr' | 'asr' | 'maghrib' | 'isha';
  type EventKey = PrayerKey | 'sunrise' | 'friday-prayer';

  const PRAYERS: { key: PrayerKey; get: (d: DayTimings) => DayTimings['fajr'] }[] = [
    { key: 'fajr', get: (d) => d.fajr },
    { key: 'zuhr', get: (d) => d.zuhr },
    { key: 'asr', get: (d) => d.asr },
    { key: 'maghrib', get: (d) => d.sunset },
    { key: 'isha', get: (d) => d.isha },
  ];

  const DAY_MS = 24 * 60 * 60 * 1000;
  const IMMINENT_MS = 5 * 60 * 1000;

  let isLoading = false;
  let loadFailed = false;
  let showChangeMosque = false;

  let dayTimings: DayTimings | null = null;
  let hijriDate: HijriDate | null = null;
  $: midnightTime = getMidnight(dayTimings);
  $: lastThirdTime = getLastThirdOfNight(dayTimings);
  $: firstThirdTime = getFirstThirdOfNight(dayTimings);

  let isFriday = false;
  let fridayPrayerTiming: Timing | undefined;

  // Re-evaluated on every tick; everything about "next prayer" derives from it
  let now = new Date();
  $: today = toIsoDate(now);

  $: location = $lastTimings?.response.location;

  const HIJRI_AUTHORITIES: Record<number, string> = {
    [UK_ID]: 'https://moonsighting.org.uk',
    [EGYPT_ID]: 'https://www.dar-alifta.org',
  };
  $: hijriAuthority = HIJRI_AUTHORITIES[$selectedCountry?.id ?? -1];
  $: showHijriDate = hijriAuthority != null;
  $: if (!showHijriDate) hijriDate = null;

  // Everything that counts down: the five prayers, sunrise and (on Fridays) Jummah
  $: events = buildEvents(dayTimings, fridayPrayerTiming, isFriday);
  $: next = findNext(events, now);
  $: msToNext = next ? next.msUntil : 0;
  $: isImminent = next != null && msToNext <= IMMINENT_MS;
  $: progress = next ? 1 - msToNext / next.span : 0;
  $: countdown = formatDuration(msToNext, $showTimerSeconds ?? true);

  // Iqamah is tracked separately: it can still be ahead after its azan has passed
  $: hasIqamah = dayTimings != null && PRAYERS.some((p) => p.get(dayTimings!).congregation != null);
  $: nextIqamah = PRAYERS.filter((p) => !(p.key === 'zuhr' && isFriday))
    .map((p) => {
      const congregation = dayTimings ? p.get(dayTimings).congregation : undefined;
      return { key: p.key, ms: congregation ? msUntil(congregation, now) : Infinity };
    })
    .sort((a, b) => a.ms - b.ms)
    .at(0)?.key;

  function buildEvents(d: DayTimings | null, jumah: Timing | undefined, friday: boolean) {
    if (d == null) return [];

    const list: { key: EventKey; timing: Timing }[] = PRAYERS.map((p) => ({ key: p.key, timing: p.get(d).start }));
    list.push({ key: 'sunrise', timing: d.sunrise });
    if (friday && jumah) list.push({ key: 'friday-prayer', timing: jumah });

    return list.sort((a, b) => a.timing.toSeconds() - b.timing.toSeconds());
  }

  function findNext(list: typeof events, at: Date) {
    if (list.length === 0) return null;

    const ranked = list.map((event, index) => ({ event, index, ms: msUntil(event.timing, at) }));
    const soonest = ranked.reduce((a, b) => (b.ms < a.ms ? b : a));

    // Distance from the previous event (wrapping to yesterday) gives the progress bar its span
    const previous = list[(soonest.index - 1 + list.length) % list.length];
    const span = (msUntil(soonest.event.timing, at) - msUntil(previous.timing, at) + DAY_MS) % DAY_MS || DAY_MS;

    return { key: soonest.event.key, timing: soonest.event.timing, msUntil: soonest.ms, span };
  }

  /** Milliseconds until the next occurrence of a time of day. */
  function msUntil(timing: Timing, at: Date): number {
    const target = new Date(at);
    target.setHours(timing.hours, timing.minutes, timing.seconds, 0);
    if (target <= at) target.setDate(target.getDate() + 1);
    return target.valueOf() - at.valueOf();
  }

  function formatDuration(ms: number, withSeconds: boolean): string {
    const totalSeconds = Math.round(ms / 1000);
    const duration = new Timing();
    duration.hours = Math.floor(totalSeconds / 3600);
    duration.minutes = Math.floor((totalSeconds % 3600) / 60);
    duration.seconds = totalSeconds % 60;

    return duration.format(withSeconds);
  }

  function isPast(timing: Timing | undefined, at: Date): boolean {
    if (timing == null) return false;
    const secondsOfDay = at.getHours() * 3600 + at.getMinutes() * 60 + at.getSeconds();
    return timing.toSeconds() <= secondsOfDay;
  }

  async function load() {
    const key = $selectionKey;
    if (key == null) {
      showChangeMosque = true;
      isLoading = true;
      return;
    }

    // Show the last response straight away when it is still current, then revalidate in the background
    const last = $lastTimings?.key === key ? $lastTimings.response : null;
    const hasCurrentData = last?.day.date === today;
    if (hasCurrentData) show(last!.day);
    else isLoading = true;

    try {
      const selection = { country: $selectedCountry!.id, city: $selectedCity!.id, mosque: $selectedMosqueId };
      const response = await getTimings(selection, today);
      if (key !== $selectionKey) return; // the selection changed while loading
      $lastTimings = { key, response };
      show(response.day);
      loadFailed = false;
    } catch (err) {
      console.error(err);
      loadFailed = !hasCurrentData;
    } finally {
      isLoading = false;
    }
  }

  function show(day: Day) {
    const pair = (p: Day['fajr']) => ({
      start: new Timing(p.start),
      congregation: p.congregation ? new Timing(p.congregation) : undefined,
    });

    dayTimings = {
      fajr: pair(day.fajr),
      sunrise: new Timing(day.sunrise),
      zuhr: pair(day.zuhr),
      asr: pair(day.asr),
      sunset: pair(day.maghrib),
      isha: pair(day.isha),
    };

    fridayPrayerTiming = day.jumah ? new Timing(day.jumah) : undefined;
    isFriday = new Date(`${day.date}T12:00:00`).getDay() == 5;
  }

  function toIsoDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  async function setHijriDate(countryId: number) {
    try {
      // The service is throttled so calling it continuously is safe
      const date = await getHijriDate(countryId);
      if (countryId === $selectedCountry?.id) hijriDate = date;
    } catch {
      hijriDate = null;
    }
  }

  function closeChangeMosque() {
    if ($selectionKey != null) {
      showChangeMosque = false;
    }
  }

  function toggleShowTimerSeconds() {
    $showTimerSeconds = !$showTimerSeconds;
  }

  // Reload on a new day or a new location; the hijri date is refreshed on a new day too
  $: $selectionKey, today, load();
  // Each country follows its own authority, so a country change must drop the previous date
  $: if ($selectedCountry?.id) hijriDate = null;
  $: if (today && showHijriDate && $selectedCountry) setHijriDate($selectedCountry.id);

  onMount(() => {
    const tickIntervalId = setInterval(() => (now = new Date()), 500);
    return () => clearInterval(tickIntervalId);
  });

  $: t = getTranslator($selectedLanguage as Language);
  $: nextTime = next?.timing.format();
</script>

<div in:fade>
  <Title>
    {#if hijriDate != null}
      <p class="hijri muted">
        {hijriDate.day}
        {t(hijriDate.month)}
        {hijriDate.year}
        <a href={hijriAuthority} target="_blank" rel="noreferrer" aria-label={hijriAuthority}>*</a>
      </p>
    {/if}
  </Title>

  {#if loadFailed}
    <section class="card failed">
      <p>{t('load-failed')}</p>
      <button class="pill" on:click={load}>{t('retry')}</button>
    </section>
  {:else if isLoading}
    <div class="skeleton" style="height: 4rem; margin-bottom: 1rem" />
    <div class="skeleton" style="height: 10rem; margin-bottom: 1rem" />
    <div class="skeleton" style="height: 16rem" />
  {:else}
    <section class="card mosque">
      <div class="mosque-info" title={t('displaying-from')}>
        <h3>{$selectedLanguage === 'ar' ? location?.titleAr ?? location?.title : location?.title}</h3>
        <div class="muted small">
          {$selectedLanguage === 'ar' ? location?.subtitleAr ?? location?.subtitle : location?.subtitle}
        </div>
      </div>
      <button class="pill" on:click={() => (showChangeMosque = true)}>{t('change')}</button>
    </section>

    <section class="card hero" class:imminent={isImminent}>
      <div class="hero-label">
        {#key next?.key}
          <span in:fade>{t(next?.key)}</span>
        {/key}
        <span class="muted">· {nextTime}</span>
      </div>

      <button
        class="not-button countdown"
        class:danger={isImminent}
        title={t('toggle-seconds')}
        aria-label={t('toggle-seconds')}
        on:click={toggleShowTimerSeconds}
      >
        {countdown}
      </button>

      <div class="progress" role="presentation">
        <div class="bar" style="width: {Math.min(Math.max(progress, 0), 1) * 100}%" />
      </div>
    </section>

    <section class="card prayers" style="--time-columns: {hasIqamah ? 2 : 1}">
      <div class="row head muted small">
        <span />
        <span>{t('azan')}</span>
        {#if hasIqamah}<span>{t('iqamah')}</span>{/if}
      </div>

      {#each PRAYERS as prayer (prayer.key)}
        {@const timing = dayTimings ? prayer.get(dayTimings) : undefined}
        <div
          class="row"
          class:current={next?.key === prayer.key}
          class:past={isPast(timing?.start, now) && next?.key !== prayer.key}
        >
          <span class="label">{t(prayer.key)}</span>
          <span class="time">{timing?.start.format()}</span>
          {#if hasIqamah}
            <span class="time" class:accent={nextIqamah === prayer.key}>
              {prayer.key === 'zuhr' && isFriday ? '-' : timing?.congregation?.format() ?? '-'}
            </span>
          {/if}
        </div>
      {/each}
    </section>

    <section class="card others">
      <div class="other" class:accent={next?.key === 'sunrise'}>
        <span>{t('sunrise')}</span>
        <span class="time">{dayTimings?.sunrise.format()}</span>
      </div>

      {#if isFriday && fridayPrayerTiming}
        <div class="other" class:accent={next?.key === 'friday-prayer'}>
          <span>{t('friday-prayer')}</span>
          <span class="time">{fridayPrayerTiming?.format()}</span>
        </div>
      {/if}

      <div class="other muted">
        <span>{t('first-third-of-night')}</span>
        <span class="time">{firstThirdTime?.format()}</span>
      </div>

      <div class="other muted">
        <span>{t('midnight')}</span>
        <span class="time">{midnightTime?.format()}</span>
      </div>

      <div class="other muted">
        <span>{t('last-third-of-night')}</span>
        <span class="time">{lastThirdTime?.format()}</span>
      </div>
    </section>
  {/if}
</div>

{#if showChangeMosque}
  <ChangeMosque onClose={closeChangeMosque} />
{/if}

<style>
  section {
    margin-bottom: 0.6rem;
  }

  .small {
    font-size: 0.75rem;
  }

  .time {
    font-variant-numeric: tabular-nums;
  }

  .hijri {
    margin: 0.15rem 0 0;
    font-size: 0.85rem;
  }

  .failed {
    padding: 1.5rem;
    text-align: center;
  }

  .mosque {
    position: relative;
    text-align: center;
    /* Reserve room for the button on both sides so the text stays centred */
    padding: 0.6rem 5rem;
  }

  .mosque h3 {
    margin: 0;
    font-size: 1rem;
  }

  .mosque .pill {
    position: absolute;
    inset-inline-end: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.3rem 0.75rem;
    font-size: 0.85rem;
  }

  .hero {
    padding: 0.75rem 1rem 0.9rem;
    text-align: center;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .hero.imminent {
    border-color: var(--danger);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    50% {
      box-shadow: 0 0 0 6px var(--danger-soft);
    }
  }

  .hero-label {
    font-size: 0.95rem;
    font-weight: bold;
    color: var(--accent);
  }

  .hero.imminent .hero-label {
    color: var(--danger);
  }

  .countdown {
    display: block;
    width: 100%;
    margin-block: 0 0.6rem;
    padding: 0;

    font-size: clamp(2.25rem, 11vw, 3rem);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    direction: ltr;
  }

  .progress {
    height: 0.3rem;
    border-radius: 999px;
    background: var(--accent-soft);
    overflow: hidden;
  }

  .bar {
    height: 100%;
    border-radius: inherit;
    background: var(--accent);
    transition: width 0.5s linear;
  }

  .hero.imminent .progress {
    background: var(--danger-soft);
  }

  .hero.imminent .bar {
    background: var(--danger);
  }

  .prayers {
    padding: 0.35rem;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr repeat(var(--time-columns, 2), 4.5rem);
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-radius: 0.6rem;
    transition: background-color 0.25s, opacity 0.25s;
  }

  .row > :not(.label) {
    text-align: center;
  }

  .row.head {
    padding-block: 0.2rem;
  }

  .row .label {
    font-weight: bold;
  }

  .row.current {
    background: var(--accent-soft);
    color: var(--accent);
    font-weight: bold;
  }

  .row.past {
    opacity: 0.5;
  }

  .accent {
    color: var(--accent);
    font-weight: bold;
  }

  .others {
    padding: 0.25rem 0.9rem;
  }

  .other {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 0.4rem;
    font-size: 0.95rem;
  }

  .other + .other {
    border-top: 1px solid var(--border);
  }
</style>
