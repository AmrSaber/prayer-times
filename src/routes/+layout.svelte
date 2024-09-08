<script lang="ts">
  import { getTranslator } from '$lib/i18n';
  import { Language } from '$lib/i18n/enums';
  import { selectedLanguage } from '$lib/stores';
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

  $: t = getTranslator($selectedLanguage as Language);

  // Set arabic tag based on language
  $: document.body.classList.toggle('arabic', $selectedLanguage === Language.AR);
</script>

<svelte:head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-R76D3CED01"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-R76D3CED01');
  </script>

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
    {t('powered-by')} <a href="https://my-masjid.com" target="_blank">my-masjid.com</a>
  </span>
</footer>

<style>
  #spacer {
    flex-grow: 1;
    min-height: 2rem;
  }

  footer {
    padding-block: 0.5rem;
    padding-inline: 1rem;

    width: 100%;
    display: flex;
    justify-content: end;
    align-items: center;
  }

  footer .powered-by {
    font-size: 0.75rem;
  }

  footer .github-mark {
    width: 1.75rem;
    padding: 0.25rem;
  }
</style>
