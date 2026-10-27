<script lang="ts" context="module">
  export interface ListItem {
    label: string;
    labelAr?: string;
    complete?: boolean;
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

  // Shorter lists fit on screen, so remembering a pick would not save anything
  const RECENTS_MIN_ITEMS = 3;

  // Below this many items, searching adds more clutter than it saves
  const SEARCH_MIN_ITEMS = 8;

  $: t = getTranslator($selectedLanguage as Language);

  const recents = createPersistentStore<ListItem[]>(`cache::recent::${persistenceKey}`, []);
  $: recentIds = $recents?.map((item) => item.id) ?? [];

  let isLoading = true;
  let items: ListItem[] = [];
  let query = '';

  $: needle = query.trim().toLowerCase();
  const matches = (item: ListItem, needle: string) =>
    `${item.label} ${item.labelAr ?? ''}`.toLowerCase().includes(needle);
  const labelOf = (item: ListItem, language: string | null | undefined) =>
    language === 'ar' && item.labelAr ? item.labelAr : item.label;
  $: visibleRecents = ($recents ?? []).filter((item) => matches(item, needle));
  $: visibleItems = items.filter((item) => !recentIds.includes(item.id) && matches(item, needle));

  function onSelected(selected: ListItem) {
    if (items.length > RECENTS_MIN_ITEMS) {
      const filteredRecents = $recents?.filter((item) => item.id != selected.id) ?? [];
      $recents = [selected, ...filteredRecents];
    }

    onItemSelected(selected);
  }

  function removeRecent(item: ListItem) {
    $recents = ($recents ?? []).filter((recent) => recent.id !== item.id);
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
    <div class="title muted">{title}</div>

    {#if items.length > SEARCH_MIN_ITEMS}
      <input class="search" type="search" placeholder={t('search')} aria-label={t('search')} bind:value={query} />
    {/if}

    <ul>
      {#each visibleRecents as item (item.id)}
        <li class="recent">
          <button
            class="not-button star"
            title={t('remove-recent')}
            aria-label={t('remove-recent')}
            on:click={() => removeRecent(item)}
          >
            ★
          </button>
          <button on:click={() => onSelected(item)} class="not-button row">
            {labelOf(item, $selectedLanguage)}
          </button>
        </li>
      {/each}

      {#if $recents?.length}
        <li class="separator">
          <hr />
          <button class="not-button clickable" on:click={() => ($recents = [])}>
            {t('clear')}
          </button>
        </li>
      {/if}

      {#each visibleItems as item (item.id)}
        <li>
          <button on:click={() => onSelected(item)} class="not-button row">
            {labelOf(item, $selectedLanguage)}
          </button>
        </li>
      {/each}
    </ul>

    {#if visibleRecents.length + visibleItems.length === 0}
      <div class="empty muted">{t('no-results')}</div>
    {/if}
  {/if}
</div>

<style>
  .load-container {
    padding: 2em;
  }

  .title {
    font-size: 0.875rem;
    margin-block: 0.25rem 0.75rem;
  }

  .search {
    width: 100%;
    padding: 0.65rem 0.9rem;
    margin-bottom: 0.5rem;

    font: inherit;
    color: inherit;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    width: 100%;
    padding: 0.75rem;
    border-radius: 0.6rem;
    text-align: start;

    transition: background-color 0.12s;
  }

  .row:hover,
  .row:focus-visible {
    background: var(--surface-hover);
  }

  .recent {
    display: flex;
    align-items: center;
    border-radius: 0.6rem;
  }

  .recent:hover {
    background: var(--surface-hover);
  }

  .star {
    color: var(--accent);
    font-size: 0.8em;
    padding: 0.75rem 0.25rem 0.75rem 0.75rem;
    border-radius: 0.6rem;
  }

  /* A star that clears the entry shows what it will do */
  .star:hover,
  .star:focus-visible {
    color: var(--danger);
  }

  .separator {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding-block: 0.25rem;
  }

  .separator hr {
    flex-grow: 1;
    height: 0;
    border: none;
    border-top: 1px solid var(--border);
  }

  .separator button {
    font-size: 0.75rem;
  }

  .empty {
    text-align: center;
    padding: 1.5rem;
  }
</style>
