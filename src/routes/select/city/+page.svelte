<script lang="ts">
  import { fade } from 'svelte/transition';
  import { getRecentCities, selectedCity, selectedCountry, selectedLanguage, selectedMosque } from '$lib/stores';
  import { getCities } from '$lib/services';
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import Title from '$lib/components/Title.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import type { City } from '$lib/types/pure';
  import RecentsSeparator from '$lib/components/RecentsSeparator.svelte';
  import { goto } from '$app/navigation';

  let cities: City[];
  let isLoading = false;

  const recentCities = getRecentCities($selectedCountry!);
  $: recentCityIds = $recentCities?.map((c) => c.id) ?? [];

  $: t = getTranslator($selectedLanguage as Language);

  async function loadCities() {
    isLoading = true;
    cities = await getCities($selectedCountry!.id);
    isLoading = false;
  }

  async function selectCity(city: City) {
    $selectedCity = city;
    $selectedMosque = null;

    goto('/select/mosque');

    if (cities.length > 1) {
      const filteredRecents = $recentCities?.filter((c) => c.id != city.id) ?? [];
      $recentCities = [city, ...filteredRecents];
    }
  }

  loadCities();
</script>

<div in:fade>
  <Title />

  {#if isLoading}
    <div class="load-container centerer">
      <Loader />
    </div>
  {:else}
    <div>{t('select-city-in')} {$selectedCountry?.name}:</div>
    <ul>
      {#if $recentCities?.length != 0}
        {#each $recentCities ?? [] as city (city.id)}
          <li class="clickable">
            <button on:click={() => selectCity(city)} class="not-button clickable">
              {city.name}
            </button>
          </li>
        {/each}

        <RecentsSeparator store={recentCities} />
      {/if}

      {#each cities.filter((c) => !recentCityIds.includes(c.id)) as city (city.id)}
        <li class="clickable">
          <button on:click={() => selectCity(city)} class="not-button clickable">
            {city.name}
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
