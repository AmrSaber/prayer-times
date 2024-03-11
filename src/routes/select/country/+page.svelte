<script lang="ts">
	import { fade } from 'svelte/transition';
	import { selectedCity, selectedCountry, selectedLanguage, selectedMosque } from '$lib/stores';
	import { getCountries } from '$lib/services';
	import { getTranslator } from '$lib/i18n';
	import type { Language } from '$lib/i18n/enums';
	import Title from '$lib/components/Title.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import type { Country } from '$lib/types/pure';

	let countriesPromise = getCountries();

	$: t = getTranslator($selectedLanguage as Language);

	function selectCountry(country: Country) {
		$selectedCountry = country;
		$selectedCity = null;
		$selectedMosque = null;

		location.assign('/select/city');
	}
</script>

<div in:fade>
	<Title />

	{#await countriesPromise}
		<div class="load-container centerer">
			<Loader />
		</div>
	{:then countries}
		<div>{t('select-country')}:</div>
		<ul>
			{#each countries as country (country.id)}
				<li class="clickable">
					<button on:click={() => selectCountry(country)} class="not-button clickable">
						{country.name}
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
