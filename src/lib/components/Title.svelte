<script lang="ts">
	import { getTranslator } from '$lib/i18n';
	import { Language } from '$lib/i18n/enums';
	import { selectedLanguage } from '$lib/stores';
	import Spacer from './spacer.svelte';
	import { selectedCity, selectedCountry, selectedMosque } from '../stores';

	$: t = getTranslator($selectedLanguage as Language);

	function navigate() {
		if ($selectedCountry == null) {
			if (!location.href.endsWith('/select/country')) location.replace('/select/country');
		} else if ($selectedCity == null) {
			if (!location.href.endsWith('/select/city')) location.replace('/select/city');
		} else if ($selectedMosque == null) {
			if (!location.href.endsWith('/select/mosque')) location.replace('/select/mosque');
		} else {
			location.replace('/');
		}
	}
</script>

<h2>
	<button on:click={navigate} class="not-button title"> {t('title')} </button>

	<span class="spacer" />

	<button
		class="not-button clickable change-lang"
		on:click={() => {
			if ($selectedLanguage === Language.EN) $selectedLanguage = Language.AR;
			else $selectedLanguage = Language.EN;
		}}
	>
		{t('change-language')}
	</button>
</h2>

<hr />
<Spacer />

<style>
	h2 {
		display: flex;
		align-items: center;
	}

	h2 .spacer {
		flex-grow: 1;
	}

	.title {
		cursor: pointer;
	}

	.change-lang {
		font-size: 1rem;
	}
</style>
