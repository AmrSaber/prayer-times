<script lang="ts">
	import { fade } from 'svelte/transition';
	import Loader from './Loader.svelte';
	import { selectedMosque } from '$lib/stores';
	import { fetchMosques } from '$lib/api';

	let mosquesPromise = fetchMosques();
</script>

<div in:fade>
	<h1>Prayer Times</h1>
	{#await mosquesPromise}
		<div class="load-container centerer">
			<Loader />
		</div>
	{:then mosques}
		<div>Select mosque in Cambridge:</div>
		<ul>
			{#each mosques as mosque (mosque.id)}
				<li class="clickable">
					<button on:click={() => ($selectedMosque = mosque)} class="not-button clickable">
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
