<script lang="ts">
  import { getTranslator } from '#lib/i18n/index.ts';
  import type { Language } from '#lib/i18n/enums.ts';
  import { selectedLanguage } from '#lib/stores/index.ts';
  import { onMount, type Snippet } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  interface Props {
    contentDiv?: HTMLDivElement | undefined;
    label?: string;
    onclose: () => unknown;
    children?: Snippet;
  }

  let { contentDiv = $bindable(undefined), label = '', onclose, children }: Props = $props();

  let t = $derived(getTranslator($selectedLanguage as Language));

  // Move focus into the dialog so keyboard and screen-reader users start inside it
  onMount(() => contentDiv?.focus());
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="container" transition:fade={{ duration: 150 }} onclick={(e) => e.target === e.currentTarget && onclose()}>
  <div
    class="content"
    role="dialog"
    aria-modal="true"
    aria-label={label || t('title')}
    tabindex="-1"
    bind:this={contentDiv}
    transition:fly={{ y: 24, duration: 200 }}
  >
    {@render children?.()}
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
