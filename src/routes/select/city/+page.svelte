<script lang="ts">
  import { goto } from '$app/navigation';
  import ListWithRecents, { type ListItem } from '$lib/components/ListWithRecents.svelte';
  import Title from '$lib/components/Title.svelte';
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import { getCities } from '$lib/services';
  import { selectedCity, selectedCountry, selectedLanguage, selectedMosque } from '$lib/stores';
  import { fade } from 'svelte/transition';

  $: t = getTranslator($selectedLanguage as Language);

  async function loadCities() {
    const cities = await getCities($selectedCountry!.id);
    return cities.map((city) => {
      return { id: city.id, label: city.name } as ListItem;
    });
  }

  function selectCity(item: ListItem) {
    $selectedCity = { id: item.id as number, name: item.label };
    $selectedMosque = null;

    goto('/select/mosque');
  }
</script>

<div in:fade>
  <Title />

  <ListWithRecents
    title={`${t('select-city-in')} ${$selectedCountry?.name}:`}
    loadItems={loadCities}
    onItemSelected={selectCity}
    persistenceKey="select-city"
  />
</div>
