<script lang="ts">
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import { getCities, getCountries, getMosques } from '$lib/services';
  import { lastTimings, selectedCity, selectedCountry, selectedLanguage, selectedMosqueId } from '$lib/stores';
  import type { ListItem } from './ListWithRecents.svelte';
  import ListWithRecents from './ListWithRecents.svelte';
  import Modal from './Modal.svelte';

  export let onClose: () => unknown;

  let modalContent: HTMLDivElement;

  $: t = getTranslator($selectedLanguage as Language);

  enum Mode {
    CHANGE_COUNTRY,
    CHANGE_CITY,
    CHANGE_MOSQUE,
  }

  // Start at the first step that still needs a value
  let mode = Mode.CHANGE_MOSQUE;
  if ($selectedCountry == null) {
    mode = Mode.CHANGE_COUNTRY;
  } else if ($selectedCity == null) {
    mode = Mode.CHANGE_CITY;
  }

  $: steps = [
    { mode: Mode.CHANGE_COUNTRY, label: t('country'), value: $selectedCountry?.name, enabled: true },
    { mode: Mode.CHANGE_CITY, label: t('city'), value: $selectedCity?.name, enabled: $selectedCountry != null },
    {
      mode: Mode.CHANGE_MOSQUE,
      label: t('mosque'),
      value: $selectedMosqueId != null ? $lastTimings?.response.location.title : undefined,
      enabled: $selectedCity != null,
    },
  ];

  async function loadMosques() {
    const mosques = await getMosques($selectedCountry!.id, $selectedCity!.id);
    return mosques.map((mosque) => {
      return { id: mosque.id, label: mosque.name } as ListItem;
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

<Modal on:close={onClose} bind:contentDiv={modalContent} label={t('change-mosque-title')}>
  <div class="top">
    <nav class="steps" aria-label="steps">
      {#each steps as step (step.mode)}
        <button
          class="not-button step"
          class:active={mode === step.mode}
          disabled={!step.enabled}
          aria-current={mode === step.mode ? 'step' : undefined}
          on:click={() => changeMode(step.mode)}
        >
          <span class="step-label">{step.label}</span>
          <span class="step-value">{step.value ?? '—'}</span>
        </button>
      {/each}
    </nav>

    {#if $selectedMosqueId != null}
      <button class="not-button close" aria-label={t('close')} on:click={onClose}>✕</button>
    {/if}
  </div>

  <div class="content">
    {#if mode === Mode.CHANGE_MOSQUE}
      <ListWithRecents
        title={`${t('select-mosque-in')} ${$selectedCity?.name}`}
        loadItems={loadMosques}
        onItemSelected={selectMosque}
        persistenceKey="select-mosque@{$selectedCity?.id}"
      />
    {:else if mode == Mode.CHANGE_CITY}
      <ListWithRecents
        title={`${t('select-city-in')} ${$selectedCountry?.name}`}
        loadItems={loadCities}
        onItemSelected={selectCity}
        persistenceKey="select-city@{$selectedCountry?.id}"
      />
    {:else if mode == Mode.CHANGE_COUNTRY}
      <ListWithRecents
        title={t('select-country')}
        loadItems={loadCountries}
        onItemSelected={selectCountry}
        persistenceKey="select-country"
      />
    {/if}
  </div>
</Modal>

<style>
  .top {
    position: sticky;
    top: 0;
    z-index: 1;

    display: flex;
    align-items: stretch;
    gap: 0.5rem;
    padding: 0.75rem 0.75rem 0.5rem;

    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }

  .steps {
    display: flex;
    flex: 1;
    gap: 0.25rem;
    min-width: 0;
  }

  .step {
    flex: 1;
    min-width: 0;
    padding: 0.5rem 0.6rem;

    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    text-align: start;

    border-radius: 0.6rem;
    border-bottom: 2px solid transparent;
  }

  .step:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .step.active {
    background: var(--accent-soft);
    border-bottom-color: var(--accent);
  }

  .step-label {
    font-size: 0.7rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .step-value {
    font-weight: bold;
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .close {
    width: 2.5rem;
    border-radius: 0.6rem;
    color: var(--muted);
  }

  .close:hover {
    background: var(--surface-hover);
  }

  .content {
    padding: 0.75rem;
  }
</style>
