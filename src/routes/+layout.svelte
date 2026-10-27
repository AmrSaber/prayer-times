<script lang="ts">
  import { getTranslator } from '$lib/i18n';
  import { Language } from '$lib/i18n/enums';
  import { lastTimings, selectedLanguage } from '$lib/stores';
  import './global.css';

  // Reset local storage if version doesn't match
  const LOCAL_STORAGE_VERSION = 5;
  const versionKey = 'local-storage-version';

  const savedVersion = Number(localStorage.getItem(versionKey) ?? -1);
  if (savedVersion != LOCAL_STORAGE_VERSION) {
    localStorage.clear();
    localStorage.setItem(versionKey, String(LOCAL_STORAGE_VERSION));
    location.reload();
  }

  // Drop storage left behind by the previous client-side data layer
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('cache::mosques::') || key === 'cache::selected-mosque') localStorage.removeItem(key);
  }

  $: fallback = $lastTimings?.response.fallback;
  $: source = $lastTimings?.response.source ?? { name: 'my-masjid.com', url: 'https://my-masjid.com' };

  $: t = getTranslator($selectedLanguage as Language);

  // Set arabic tag based on language
  $: document.body.classList.toggle('arabic', $selectedLanguage === Language.AR);
</script>

<svelte:head>
  <link rel="manifest" href="manifest.json" />
  <title>{t('title')}</title>
</svelte:head>

<main>
  <slot />
</main>

<div id="spacer" />

<footer>
  <a href="https://github.com/AmrSaber/prayer-times" target="_blank">
    <img class="github-mark light-only" alt="github logo" src="/github-mark.svg" />
    <img class="github-mark dark-only" alt="github logo - dark mode" src="/github-mark-white.svg" />
  </a>
  ・
  <span class="powered-by">
    {t('times-from')}
    <a href={source.url} target="_blank" rel="noreferrer">
      {$selectedLanguage === Language.AR ? source.nameAr ?? source.name : source.name}
    </a>
    {#if fallback}<span class="muted">({t('source-fallback')})</span>{/if}
  </span>
</footer>

<style>
  #spacer {
    flex-grow: 1;
    min-height: 0.5rem;
  }

  footer {
    padding: 0.5rem;

    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    color: var(--muted);
  }

  footer .powered-by {
    font-size: 0.75rem;
  }

  footer .github-mark {
    width: 2rem;
    padding: 0.4rem;
  }
</style>
