<script lang="ts">
	import { fade } from 'svelte/transition';
	import { selectedCity, selectedCountry, selectedLanguage, selectedMosque } from '$lib/stores';
	import { getCities, getCountries } from '$lib/services';
	import { getTranslator } from '$lib/i18n';
	import type { Language } from '$lib/i18n/enums';
	import Title from '$lib/components/Title.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import type { City } from '$lib/types/pure';

	let citiesPromise = getCities($selectedCountry!.id);

	$: t = getTranslator($selectedLanguage as Language);

	function selectCity(city: City) {
		$selectedCity = city;
		$selectedMosque = null;

		location.assign('/select/mosque');
	}
</script>

<div in:fade>
	<Title />

	{#await citiesPromise}
		<div class="load-container centerer">
			<Loader />
		</div>
	{:then cities}
		<div>{t('select-city-in')} {$selectedCountry?.name}:</div>
		<ul>
			{#each cities as city (city.id)}
				<li class="clickable">
					<button on:click={() => selectCity(city)} class="not-button clickable">
						{city.name}
					</button>
				</li>
			{/each}
		</ul>
	{:catch error}
		<div class="danger">Error getting supported countries, please refresh or try again later</div>
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
