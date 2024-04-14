<script lang="ts">
  export let contentDiv: HTMLDivElement | undefined = undefined;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="container" on:click|self on:keypress|self>
  <div class="content" bind:this={contentDiv}>
    <slot />
  </div>
</div>

<style>
  .container {
    z-index: 2;

    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;

    backdrop-filter: blur(3px);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    border: 1px solid black;
    border-radius: 6px;

    background-color: white;
    padding: 0.5rem;

    max-width: 75vw;
    max-height: 70vh;
    overflow: auto;
  }

  @media screen and (prefers-color-scheme: dark) {
    .content {
      background-color: #222;
      border-color: white;
    }
  }
</style>
