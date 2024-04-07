<script lang="ts" context="module">
  export interface ListItem {
    label: string;
    id: string | number;
  }
</script>

<script lang="ts">
  import { createPersistentStore } from '$lib/stores/utils';
  import { onMount } from 'svelte';
  import Loader from './Loader.svelte';
  import { getTranslator } from '$lib/i18n';
  import { selectedLanguage } from '$lib/stores';
  import type { Language } from '$lib/i18n/enums';

  export let title: string;
  export let loadItems: () => Promise<ListItem[]>;
  export let onItemSelected: (item: ListItem) => unknown;
  export let persistenceKey: string;

  $: t = getTranslator($selectedLanguage as Language);

  const recents = createPersistentStore<ListItem[]>(`cache::recent::${persistenceKey}`, []);
  $: recentIds = $recents?.map((item) => item.id) ?? [];

  let isLoading = true;
  let items: ListItem[];

  function onSelected(selected: ListItem) {
    if (items.length > 5) {
      const filteredRecents = $recents?.filter((item) => item.id != selected.id) ?? [];
      $recents = [selected, ...filteredRecents];
    }

    onItemSelected(selected);
  }

  onMount(async () => {
    items = await loadItems();
    isLoading = false;
  });
</script>

<div>
  {#if isLoading}
    <div class="load-container centerer">
      <Loader />
    </div>
  {:else}
    <div>{title}</div>
    <ul>
      {#if $recents?.length != 0}
        {#each $recents ?? [] as item (item.id)}
          <li class="clickable">
            <button on:click={() => onSelected(item)} class="not-button clickable">
              {item.label}
            </button>
          </li>
        {/each}

        <div class="separator">
          <hr />
          <button class="not-button clickable" on:click={() => ($recents = [])}>
            {t('clear')}
          </button>
        </div>
      {/if}

      {#each items.filter((item) => !recentIds.includes(item.id)) as item (item.id)}
        <li class="clickable">
          <button on:click={() => onSelected(item)} class="not-button clickable">
            {item.label}
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

  .separator {
    display: flex;
    width: 100%;
    gap: 0.25rem;

    justify-content: center;
    align-items: center;
  }

  .separator hr {
    flex-grow: 1;
    height: 0px;
  }

  .separator button {
    font-size: 0.75em;
  }
</style>
