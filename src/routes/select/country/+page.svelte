<script lang="ts">
  import { goto } from '$app/navigation';
  import type { ListItem } from '$lib/components/ListWithRecents.svelte';
  import ListWithRecents from '$lib/components/ListWithRecents.svelte';
  import Title from '$lib/components/Title.svelte';
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import { getCountries } from '$lib/services';
  import { selectedCity, selectedCountry, selectedLanguage, selectedMosque } from '$lib/stores';
  import { fade } from 'svelte/transition';

  $: t = getTranslator($selectedLanguage as Language);

  async function loadCountries() {
    const countries = await getCountries();
    return countries.map((country) => {
      return { id: country.id, label: country.name } as ListItem;
    });
  }

  async function selectCountry(item: ListItem) {
    $selectedCountry = { id: item.id as number, name: item.label };
    $selectedCity = null;
    $selectedMosque = null;

    goto('/select/city');
  }
</script>

<div in:fade>
  <Title />

  <ListWithRecents
    title={`${t('select-country')}:`}
    loadItems={loadCountries}
    onItemSelected={selectCountry}
    persistenceKey="select-country"
  />
</div>
