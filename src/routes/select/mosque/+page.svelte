<script lang="ts">
  import { fade } from 'svelte/transition';
  import { selectedLanguage, selectedMosque, selectedCity, selectedCountry } from '$lib/stores';
  import { getMosques } from '$lib/services';
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import Title from '$lib/components/Title.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import type { Mosque } from '$lib/types/pure';
  import { goto } from '$app/navigation';

  let isLoading = false;
  let mosques: Mosque[];

  $: t = getTranslator($selectedLanguage as Language);

  async function loadMosques() {
    isLoading = true;
    mosques = await getMosques($selectedCountry!.id, $selectedCity!.id);
    isLoading = false;
  }

  function selectMosque(mosque: Mosque) {
    $selectedMosque = mosque;
    goto('/');
  }

  loadMosques();
</script>

<div in:fade>
  <Title />

  {#if isLoading}
    <div class="load-container centerer">
      <Loader />
    </div>
  {:else}
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
  {/if}
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
</style>
