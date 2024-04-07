<script lang="ts">
  import { goto } from '$app/navigation';
  import ListWithRecents, { type ListItem } from '$lib/components/ListWithRecents.svelte';
  import Title from '$lib/components/Title.svelte';
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import { getMosques } from '$lib/services';
  import { selectedCity, selectedCountry, selectedLanguage, selectedMosqueId } from '$lib/stores';
  import { fade } from 'svelte/transition';

  $: t = getTranslator($selectedLanguage as Language);

  async function loadMosques() {
    const mosques = await getMosques($selectedCountry!.id, $selectedCity!.id);
    return mosques.map((mosque) => {
      return { id: mosque.guidId, label: mosque.name } as ListItem;
    });
  }

  function selectMosque(item: ListItem) {
    $selectedMosqueId = item.id as string;
    goto('/');
  }
</script>

<div in:fade>
  <Title />

  <ListWithRecents
    title={`${t('select-mosque in')} ${$selectedCity?.name}:`}
    loadItems={loadMosques}
    onItemSelected={selectMosque}
    persistenceKey="select-mosque"
  />
</div>
