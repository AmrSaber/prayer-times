<script lang="ts">
	import SelectMosque from '$lib/components/SelectMosque.svelte';
	import { selectedMosque } from '$lib/stores';
	import Timings from '$lib/components/Timings.svelte';

	// Reset local storage if version doesn't match
	const LOCAL_STORAGE_VERSION = 0;
	const versionKey = 'local-storage-version';

	const savedVersion = Number(localStorage.getItem(versionKey) ?? -1);
	if (savedVersion != LOCAL_STORAGE_VERSION) {
		localStorage.clear();
		localStorage.setItem(versionKey, String(LOCAL_STORAGE_VERSION));
	}
</script>

<main>
	{#if $selectedMosque == null}
		<SelectMosque />

		<style>
			main {
				padding: 0.5rem 2rem;
			}
		</style>
	{:else}
		<Timings />
	{/if}
</main>
