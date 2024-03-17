<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { getHijriDate, getTimings } from '$lib/services';
	import { selectedLanguage, selectedMosque, selectedCity, selectedCountry } from '$lib/stores';
	import { Timing, type HijriDate } from '$lib/types';
	import type { DayTimings } from '$lib/types/pure';
	import { getLastThirdOfNight, getMidnight } from '$lib/utils';
	import { markImminentElement } from '$lib/helpers';
	import { fade } from 'svelte/transition';
	import { LocalStorageCache } from '$lib/utils/cache';
	import type { TimingsModel } from '$lib/api';
	import { getTranslator } from '$lib/i18n';
	import type { Language } from '$lib/i18n/enums';
	import Title from '$lib/components/Title.svelte';
	import Spacer from '$lib/components/spacer.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import { UK_ID } from '$lib/constants';

	let dayTimings: DayTimings | null = null;
	let hijriDate: HijriDate | null = null;
	$: midnightTime = getMidnight(dayTimings);
	$: lastThirdTime = getLastThirdOfNight(dayTimings);

	$: mosqueId = $selectedMosque?.guidId!;
	$: timingsCacheKey = `mosques::${mosqueId}::timings`;

	let nextPrayerTime: Timing | undefined;
	let nextPrayerLabel: string | undefined;
	let timeUntilNextPrayer: Timing | undefined;
	let isImminent = false;

	$: showHijriDate = $selectedCountry?.id === UK_ID;

	async function cacheTimings() {
		const timings = await getTimings(mosqueId);
		if (timings != null) LocalStorageCache.set(timingsCacheKey, timings);
	}

	async function bind() {
		if (!LocalStorageCache.has(timingsCacheKey)) {
			await cacheTimings();
		} else {
			// Revalidate in the background
			cacheTimings();
		}

		if (showHijriDate) {
			try {
				hijriDate = await getHijriDate($selectedCountry!.id);
			} catch {
				showHijriDate = false;
			}
		}

		const timings = LocalStorageCache.get(timingsCacheKey) as TimingsModel;

		const now = new Date();
		const today = now.getUTCDate();
		const thisMonth = now.getUTCMonth() + 1;

		const todayTiming = timings.salahTimings.find((t) => t.day == today && t.month == thisMonth);

		if (todayTiming == null) {
			throw new Error("could not find today's timing");
		}

		dayTimings = {
			fajr: {
				start: new Timing(todayTiming.fajr),
				congregation: new Timing(todayTiming.iqamah_Fajr)
			},
			sunrise: new Timing(todayTiming.shouruq),
			zuhr: {
				start: new Timing(todayTiming.zuhr),
				congregation: new Timing(todayTiming.iqamah_Zuhr)
			},
			asr: {
				start: new Timing(todayTiming.asr),
				congregation: new Timing(todayTiming.iqamah_Asr)
			},
			sunset: {
				start: new Timing(todayTiming.maghrib),
				congregation: new Timing(todayTiming.iqamah_Maghrib)
			},
			isha: {
				start: new Timing(todayTiming.isha),
				congregation: new Timing(todayTiming.iqamah_Isha)
			}
		};

		// Wait for UI to update so that the related tags are displayed
		await tick();

		// Mark next values
		const nextPrayer = markImminentElement('.prayer-time');
		markImminentElement('.congregation-time');

		nextPrayerTime = new Timing(nextPrayer?.innerHTML);
		nextPrayerLabel = document.querySelector('.label:has(+ .prayer-time.next)')?.innerHTML;

		updateTimer();
	}

	function updateTimer() {
		if (nextPrayerTime == null) return;

		const now = new Date();
		timeUntilNextPrayer = new Timing();
		timeUntilNextPrayer.hours = nextPrayerTime.hours - now.getHours();
		timeUntilNextPrayer.minutes = nextPrayerTime.minutes - now.getMinutes();
		timeUntilNextPrayer.seconds = nextPrayerTime.seconds - now.getSeconds();

		timeUntilNextPrayer.normalize();
		isImminent = timeUntilNextPrayer.hours == 0 && timeUntilNextPrayer.minutes < 5;
	}

	// Update UI periodically
	const intervalId = setInterval(bind, 500);
	onMount(() => () => {
		clearInterval(intervalId);
	});

	// Bind after all global variables have been initialized
	tick().then(bind);

	// Re-bind on language change so that any saved string is localized
	selectedLanguage.subscribe(bind);

	$: t = getTranslator($selectedLanguage as Language);
</script>

<div in:fade>
	<Title />

	{#if showHijriDate && hijriDate != null}
		<div class="date">
			{hijriDate?.day}
			{t(hijriDate?.month)}
			{hijriDate?.year} <a href="https://moonsighting.org.uk" target="_blank">*</a>
		</div>

		<Spacer />
	{/if}

	<div>{t('displaying-from')}</div>
	<h3>
		{$selectedMosque?.name.split('&').at(0)?.trim()}, <br />
		{$selectedCity?.name}, <br />
		{$selectedCountry?.name}
	</h3>

	<div id="select-holder">
		<a href="/select/country"> {t('change')} </a>
	</div>

	<Spacer />

	{#if dayTimings == null}
		<div class="loader-container centerer">
			<Loader />
		</div>
	{:else}
		<div id="prayer-timer">
			<span class:danger={isImminent}>{timeUntilNextPrayer?.format(true)}</span>
			{t('to')}
			{#key nextPrayerLabel}
				<span class="label next">
					{nextPrayerLabel}
					({nextPrayerTime?.format()})
				</span>
			{/key}
		</div>

		<div class="table" id="prayer-timings">
			<hr class="separator" />

			<span />
			<span>{t('azan')}</span>
			<span>{t('iqamah')}</span>

			<span class="label">{t('fajr')}</span>
			<span class="prayer-time">{dayTimings?.fajr.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.fajr.congregation.format()}
			</span>

			<span class="label">{t('zuhr')}</span>
			<span class="prayer-time">{dayTimings?.zuhr.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.zuhr.congregation.format()}
			</span>

			<span class="label">{t('asr')}</span>
			<span class="prayer-time">{dayTimings?.asr.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.asr.congregation.format()}
			</span>

			<span class="label">{t('maghrib')}</span>
			<span class="prayer-time">{dayTimings?.sunset.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.sunset.congregation.format()}
			</span>

			<span class="label">{t('isha')}</span>
			<span class="prayer-time">{dayTimings?.isha.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.isha.congregation.format()}
			</span>
		</div>

		<Spacer --size="2rem" />

		<div class="table" id="other-timings">
			<span class="label">{t('sunrise')}</span>
			<span class="prayer-time">{dayTimings?.sunrise.format()}</span>

			<span class="label">{t('midnight')}</span>
			<span class="prayer-time">{midnightTime?.format()}</span>

			<span class="label">{t('last-third-of-night')}</span>
			<span>{lastThirdTime?.format()}</span>
		</div>
	{/if}
</div>

<style>
	.date {
		text-align: end;
		font-weight: bold;
	}

	.date a {
		padding: 0.25rem;
	}

	h3 {
		margin: 0;
		margin-top: 0.5rem;
		text-align: center;
		direction: ltr;
	}

	#select-holder {
		display: flex;
		justify-content: end;
	}

	#select-holder * {
		padding: 0.5rem;
	}

	.loader-container {
		padding: 4em;
	}

	.table {
		width: fit-content;
		display: grid;
	}

	#prayer-timings {
		margin: 2rem 1.5rem;
		padding: 0 1rem;

		grid-auto-flow: column;
		grid-template-rows: repeat(4, 1rem);

		row-gap: 1rem;
		column-gap: 1.5rem;
	}

	#prayer-timings > * {
		display: flex;
		justify-content: center;
	}

	#prayer-timings > .separator {
		grid-column: 1 / span 6;
		grid-row: 2;
		width: 100%;
	}

	.label {
		font-weight: bold;
	}

	:global(.next),
	.label:has(+ .next) {
		color: var(--accent);
	}

	span {
		transition: color 0.25s;
	}

	#prayer-timer {
		text-align: center;
		font-weight: bold;
		margin-block: 2rem;
	}

	#other-timings {
		grid-auto-flow: row;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem 1rem;
	}
</style>
