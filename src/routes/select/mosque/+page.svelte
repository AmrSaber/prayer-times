<script lang="ts">
	import { fade } from 'svelte/transition';
	import { selectedLanguage, selectedMosque, selectedCity, selectedCountry } from '$lib/stores';
	import { getMosques } from '$lib/services';
	import { getTranslator } from '$lib/i18n';
	import type { Language } from '$lib/i18n/enums';
	import Title from '$lib/components/Title.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import type { Mosque } from '$lib/types/pure';

	let mosquesPromise = getMosques($selectedCountry!.id, $selectedCity!.id);

	$: t = getTranslator($selectedLanguage as Language);

	function selectMosque(mosque: Mosque) {
		$selectedMosque = mosque;
		location.assign('/');
	}
</script>

<div in:fade>
	<Title />

	{#await mosquesPromise}
		<div class="load-container centerer">
			<Loader />
		</div>
	{:then mosques}
		<div>{t('select-mosque-in')} {$selectedCity?.name}:</div>
		<ul>
			{#each mosques as mosque (mosque.id)}
				<li class="clickable">
					<button on:click={() => selectMosque(mosque)} class="not-button clickable">
						{mosque.name}
					</button>
				</li>
			{/each}
		</ul>
	{:catch error}
		<div class="danger">Error getting supported mosques, please refresh or try again later</div>
		<div>reported error: {error}</div>
	{/await}
</div>

<style>
	.load-container {
		padding: 2em;
	}

	ul {
		padding-inline-start: 2rem;
		margin-block: 0.5rem;
	}

	li {
		padding-block: 0.25rem;
	}

	li button {
		padding: 0;
	}

	.danger {
		margin-bottom: 8px;
	}
</style>
