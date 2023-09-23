<div class="loader" />

<style>
	.loader {
		border: calc(var(--size, 2em) / 7) solid #f3f3f3; /* Light grey */
		border-top: calc(var(--size, 2em) / 7) solid #3498db; /* Blue */
		border-radius: 50%;
		width: var(--size, 2em);
		height: var(--size, 2em);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
