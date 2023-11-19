<script>
	import './global.css';
</script>

<svelte:head>
	<!-- Google analytics -->
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
