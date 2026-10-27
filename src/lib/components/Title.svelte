<script lang="ts">
  import { getTranslator } from '$lib/i18n';
  import { Language } from '$lib/i18n/enums';
  import { selectedLanguage } from '$lib/stores';

  $: t = getTranslator($selectedLanguage as Language);

  function toggleLanguage() {
    $selectedLanguage = $selectedLanguage === Language.EN ? Language.AR : Language.EN;
  }
</script>

<header>
  <div class="heading">
    <h1>{t('title')}</h1>
    <slot />
  </div>

  <button class="pill" class:arabic={$selectedLanguage !== Language.AR} on:click={toggleLanguage}>
    {t('change-language')}
  </button>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 0.75rem 0.6rem;
  }

  h1 {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.2;
  }
</style>
