<script>
	import './global.css';

	// Reset local storage if version doesn't match
	const LOCAL_STORAGE_VERSION = 1;
	const versionKey = 'local-storage-version';

	const savedVersion = Number(localStorage.getItem(versionKey) ?? -1);
	if (savedVersion != LOCAL_STORAGE_VERSION) {
		localStorage.clear();
		localStorage.setItem(versionKey, String(LOCAL_STORAGE_VERSION));
	}
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

	<title>Prayer Times</title>
</svelte:head>

<slot />

<footer>
	<a href="https://github.com/AmrSaber/prayer-times" target="_blank">
		<img class="github-mark light-only" alt="github logo" src="/github-mark.svg" />
		<img class="github-mark dark-only" alt="github logo - dark mode" src="/github-mark-white.svg" />
	</a>
	・
	<span class="powered-by">
		Powered by <a href="https://my-masjid.com" target="_blank">my-masjid.com</a>
	</span>
</footer>

<style>
	footer {
		position: fixed;
		bottom: 0.5rem;
		right: 1rem;
	}

	footer .powered-by {
		font-size: 0.75rem;
	}

	footer * {
		vertical-align: middle;
	}

	footer .github-mark {
		width: 1.75rem;
		padding: 0.25rem;
	}
</style>
