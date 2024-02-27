<script lang="ts">
	import SelectMosque from '$lib/components/SelectMosque.svelte';
	import { selectedMosque } from '$lib/stores';
	import Timings from '$lib/components/Timings.svelte';
</script>

<main>
	{#if $selectedMosque == null}
		<SelectMosque />
	{:else}
		<Timings />
	{/if}
</main>
