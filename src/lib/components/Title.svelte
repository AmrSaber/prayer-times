<script lang="ts">
  import { getTranslator } from '#lib/i18n/index.ts';
  import { Language } from '#lib/i18n/enums.ts';
  import { selectedLanguage } from '#lib/stores/index.ts';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  let t = $derived(getTranslator($selectedLanguage as Language));

  function toggleLanguage() {
    $selectedLanguage = $selectedLanguage === Language.EN ? Language.AR : Language.EN;
  }
</script>

<header>
  <div class="heading">
    <h1>{t('title')}</h1>
    {@render children?.()}
  </div>

  <button class="pill" class:arabic={$selectedLanguage !== Language.AR} onclick={toggleLanguage}>
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
