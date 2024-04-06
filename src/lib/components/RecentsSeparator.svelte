<script lang="ts">
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import { selectedLanguage } from '$lib/stores';
  import type { Writable } from 'svelte/store';

  export let store: Omit<Writable<unknown[] | null | undefined>, 'update'>;
  $: t = getTranslator($selectedLanguage as Language);
</script>

<div class="separator">
  <hr />
  <button class="not-button clickable" on:click={() => ($store = [])}>
    {t('clear')}
  </button>
</div>

<style>
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
