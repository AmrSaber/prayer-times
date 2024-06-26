<script lang="ts">
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import { getCities, getCountries, getMosques } from '$lib/services';
  import { selectedCity, selectedCountry, selectedLanguage, selectedMosqueId } from '$lib/stores';
  import type { ListItem } from './ListWithRecents.svelte';
  import ListWithRecents from './ListWithRecents.svelte';
  import Modal from './Modal.svelte';
  import Spacer from './spacer.svelte';

  export let onClose: () => unknown;

  let modalContent: HTMLDivElement;

  $: t = getTranslator($selectedLanguage as Language);

  enum Mode {
    CHANGE_MOSQUE,
    CHANGE_CITY,
    CHANGE_COUNTRY,
  }

  // Set what is being changed initially
  let mode = Mode.CHANGE_MOSQUE;
  if ($selectedCountry == null) {
    mode = Mode.CHANGE_COUNTRY;
  } else if ($selectedCity == null) {
    mode = Mode.CHANGE_COUNTRY;
  }

  async function loadMosques() {
    const mosques = await getMosques($selectedCountry!.id, $selectedCity!.id);
    return mosques.map((mosque) => {
      return { id: mosque.guidId, label: mosque.name } as ListItem;
    });
  }

  function selectMosque(item: ListItem) {
    $selectedMosqueId = item.id as string;
    onClose();
  }

  async function loadCities() {
    const cities = await getCities($selectedCountry!.id);
    return cities.map((city) => {
      return { id: city.id, label: city.name } as ListItem;
    });
  }

  function selectCity(item: ListItem) {
    if (item.id != $selectedCity?.id) {
      $selectedCity = { id: item.id as number, name: item.label };
      $selectedMosqueId = null;
    }

    changeMode(Mode.CHANGE_MOSQUE);
  }

  async function loadCountries() {
    const countries = await getCountries();
    return countries.map((country) => {
      return { id: country.id, label: country.name } as ListItem;
    });
  }

  async function selectCountry(item: ListItem) {
    if (item.id != $selectedCountry?.id) {
      $selectedCountry = { id: item.id as number, name: item.label };
      $selectedCity = null;
      $selectedMosqueId = null;
    }

    changeMode(Mode.CHANGE_CITY);
  }

  function changeMode(newMode: Mode) {
    mode = newMode;
    modalContent.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<Modal on:click={onClose} bind:contentDiv={modalContent}>
  {#if $selectedMosqueId != null}
    <div class="ender">
      <button class="not-button close" on:click={onClose}> X </button>
    </div>
  {/if}

  <div class="content">
    {#if mode === Mode.CHANGE_MOSQUE}
      <h2>{t('change-mosque-title')}</h2>

      <ListWithRecents
        title={`${t('select-mosque-in')} ${$selectedCity?.name}:`}
        loadItems={loadMosques}
        onItemSelected={selectMosque}
        persistenceKey="select-mosque@{$selectedCity?.id}"
      />

      <Spacer />

      <div class="ender">
        <button class="not-button clickable" on:click={() => changeMode(Mode.CHANGE_CITY)}>
          {t('change-city')}
        </button>
      </div>
    {:else if mode == Mode.CHANGE_CITY}
      <h2>{t('change-city-title')}</h2>

      <ListWithRecents
        title={`${t('select-city-in')} ${$selectedCountry?.name}:`}
        loadItems={loadCities}
        onItemSelected={selectCity}
        persistenceKey="select-city@{$selectedCountry?.id}"
      />

      <Spacer />

      <div class="ender">
        <button class="not-button clickable" on:click={() => changeMode(Mode.CHANGE_COUNTRY)}>
          {t('change-country')}
        </button>
      </div>
    {:else if mode == Mode.CHANGE_COUNTRY}
      <h2>{t('change-country-title')}</h2>

      <ListWithRecents
        title={`${t('select-country')}:`}
        loadItems={loadCountries}
        onItemSelected={selectCountry}
        persistenceKey="select-country"
      />
    {/if}
  </div>
</Modal>

<style>
  .close {
    width: 2.5rem;
    padding: 0.5rem;
    cursor: pointer;

    font-weight: bolder;
    font-size: 1rem;
  }

  .content {
    margin-inline: 2rem;
  }

  h2 {
    margin-top: 1rem;
  }

  .ender {
    text-align: end;
  }
</style>
