<script lang="ts">
  import { getTranslator } from '$lib/i18n';
  import type { Language } from '$lib/i18n/enums';
  import { selectedLanguage } from '$lib/stores';
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  export let contentDiv: HTMLDivElement | undefined = undefined;
  export let label = '';

  const dispatch = createEventDispatcher<{ close: void }>();

  $: t = getTranslator($selectedLanguage as Language);

  // Move focus into the dialog so keyboard and screen-reader users start inside it
  onMount(() => contentDiv?.focus());
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && dispatch('close')} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="container" transition:fade={{ duration: 150 }} on:click|self={() => dispatch('close')}>
  <div
    class="content"
    role="dialog"
    aria-modal="true"
    aria-label={label || t('title')}
    tabindex="-1"
    bind:this={contentDiv}
    transition:fly={{ y: 24, duration: 200 }}
  >
    <slot />
  </div>
</div>

<style>
  .container {
    z-index: 2;

    position: fixed;
    inset: 0;

    background: rgb(0 0 0 / 0.45);
    backdrop-filter: blur(3px);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    outline: none;

    width: min(100%, 30rem);
    max-height: 80vh;
    overflow: auto;
  }

  /* Bottom sheet on small screens */
  @media (max-width: 600px) {
    .container {
      align-items: flex-end;
    }

    .content {
      width: 100%;
      max-height: 85vh;
      border-end-start-radius: 0;
      border-end-end-radius: 0;
    }
  }
</style>
