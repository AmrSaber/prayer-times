<script lang="ts">
	import { tick } from 'svelte';
	import Loader from './Loader.svelte';
	import { fetchTimings } from '$lib/api';
	import { selectedMosque } from '$lib/stores';
	import { Timing } from '$lib/types';
	import type { DayTimings } from '$lib/types/pure';
	import { getLastThirdOfNight, getMidnight } from '$lib/utils';
	import { markImminentElement } from '$lib/helpers';
	import { fade } from 'svelte/transition';
	import Switch from './Switch.svelte';

	let dayTimings: DayTimings | null = null;
	$: midnightTime = getMidnight(dayTimings);
	$: lastThirdTime = getLastThirdOfNight(dayTimings);

	let nextPrayerTime: Timing | undefined;
	let nextPrayerLabel: string | undefined;
	let timeUntilNextPrayer: Timing | undefined;
	let isImminent = false;

	// TODO save in local storage
	let notificationsEnabled = false;
	$: {
		if (notificationsEnabled) Notification.requestPermission();
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

	async function bind() {
		const response = await fetchTimings($selectedMosque?.guidId!);

		const now = new Date();
		const today = now.getUTCDate();
		const thisMonth = now.getUTCMonth() + 1;

		const todayTiming = response.salahTimings.find((t) => t.day == today && t.month == thisMonth);

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

	setInterval(bind, 500);
</script>

<div in:fade>
	<div>Displaying prayer times from</div>
	<h3 id="mosque-name">{$selectedMosque?.name}</h3>

	<div id="select-holder">
		<button on:click={() => ($selectedMosque = null)} class="clickable not-button"> change </button>
	</div>

	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="notifications-control">
		<Switch --size="0.6em" bind:checked={notificationsEnabled} />
		<span>Notifications</span>
	</label>

	<hr />

	{#if dayTimings == null}
		<div class="loader-container centerer">
			<Loader />
		</div>
	{:else}
		<h2>Prayer Times</h2>

		<div id="prayer-timer">
			<span class:danger={isImminent}>{timeUntilNextPrayer?.format(true)}</span>
			to
			<span class="label next">
				{nextPrayerLabel} ({nextPrayerTime?.format()})
			</span>
		</div>

		<div class="table" id="prayer-timings">
			<span />
			<span>أذان</span>
			<span>إقامة</span>

			<span class="label">الفجر</span>
			<span class="prayer-time">{dayTimings?.fajr.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.fajr.congregation.format()}
			</span>

			<span class="label">الظهر</span>
			<span class="prayer-time">{dayTimings?.zuhr.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.zuhr.congregation.format()}
			</span>

			<span class="label">العصر</span>
			<span class="prayer-time">{dayTimings?.asr.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.asr.congregation.format()}
			</span>

			<span class="label">المغرب</span>
			<span class="prayer-time">{dayTimings?.sunset.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.sunset.congregation.format()}
			</span>

			<span class="label">العشاء</span>
			<span class="prayer-time">{dayTimings?.isha.start.format()}</span>
			<span class="congregation-time">
				{dayTimings?.isha.congregation.format()}
			</span>
		</div>

		<hr />

		<div class="table" id="other-timings">
			<span class="label">Sunrise</span>
			<span class="prayer-time">{dayTimings?.sunrise.format()}</span>

			<span class="label">Midnight</span>
			<span class="prayer-time">{midnightTime?.format()}</span>

			<span class="label">Last third of night</span>
			<span>{lastThirdTime?.format()}</span>
		</div>
	{/if}
</div>

<style>
	h2 {
		margin: 1rem;
	}

	#mosque-name {
		color: cornflowerblue;
		margin: 0;
	}

	#select-holder {
		display: flex;
		justify-content: end;
	}

	#select-holder button {
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
		direction: rtl;
		margin: 2rem auto;
		padding: 0 1rem;

		grid-auto-flow: column;
		grid-template-rows: repeat(3, 1rem);

		row-gap: 1rem;
		column-gap: 1.5rem;
	}

	#prayer-timings > * {
		display: flex;
		justify-content: center;
	}

	.label {
		font-weight: bold;
	}

	:global(.next),
	.label:has(+ .next) {
		color: green;
		transform: scale(1.075);
	}

	span {
		transition: transform 0.25s, color 0.25s;
	}

	#prayer-timer {
		text-align: center;
		font-weight: bold;
		margin-block: 2rem;
	}

	#other-timings {
		grid-auto-flow: row;
		grid-template-columns: 1fr 1fr;

		margin: 1rem;
		margin-top: 2rem;

		gap: 0.5rem 1rem;
	}

	.notifications-control span {
		font-size: 0.8rem;
		vertical-align: -0.4rem;
	}
</style>
