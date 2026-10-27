<div class="loader" />

<style>
  .loader {
    border: calc(var(--size, 2em) / 7) solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    width: var(--size, 2em);
    height: var(--size, 2em);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
