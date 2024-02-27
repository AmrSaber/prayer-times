<script lang="ts">
	import { getTranslator } from '$lib/i18n';
	import { Language } from '$lib/i18n/enums';
	import { selectedLanguage } from '$lib/stores';
	import Spacer from './spacer.svelte';

	$: t = getTranslator($selectedLanguage as Language);
</script>

<h2>
	{t('title')}

	<span class="spacer" />

	<button
		class="not-button clickable"
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
</style>
