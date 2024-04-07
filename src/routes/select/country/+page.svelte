<script lang="ts">
  import { fade } from 'svelte/transition';
  import { recentCountries, selectedCity, selectedCountry, selectedLanguage, selectedMosque } from '$lib/stores';
  import { getCountries } from '$lib/services';
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import Title from '$lib/components/Title.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import type { Country } from '$lib/types/pure';
  import RecentsSeparator from '$lib/components/RecentsSeparator.svelte';
  import { goto } from '$app/navigation';

  let isLoading = false;
  let countries: Country[];

  $: recentCountryIds = $recentCountries?.map((c) => c.id) ?? [];

  $: t = getTranslator($selectedLanguage as Language);

  async function loadCountries() {
    isLoading = true;
    countries = await getCountries();
    isLoading = false;
  }

  function selectCountry(country: Country) {
    $selectedCountry = country;
    $selectedCity = null;
    $selectedMosque = null;

    goto('/select/city');

    const filteredRecents = $recentCountries?.filter((c) => c.id != country.id) ?? [];
    $recentCountries = [country, ...filteredRecents];
  }

  loadCountries();
</script>

<div in:fade>
  <Title />

  {#if isLoading}
    <div class="load-container centerer">
      <Loader />
    </div>
  {:else}
    <div>{t('select-country')}:</div>
    <ul>
      {#if $recentCountries?.length != 0}
        {#each $recentCountries ?? [] as country (country.id)}
          <li class="clickable">
            <button on:click={() => selectCountry(country)} class="not-button clickable">
              {country.name}
            </button>
          </li>
        {/each}

        <RecentsSeparator store={recentCountries} />
      {/if}

      {#each countries.filter((c) => !recentCountryIds.includes(c.id)) as country (country.id)}
        <li class="clickable">
          <button on:click={() => selectCountry(country)} class="not-button clickable">
            {country.name}
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
