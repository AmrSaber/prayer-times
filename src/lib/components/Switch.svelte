<!-- Source: https://www.w3schools.com/howto/howto_css_switch.asp -->
<script lang="ts">
	export let checked = false;
	export let round = true;
</script>

<label class="switch">
	<input bind:checked type="checkbox" />
	<span class="slider" class:round />
</label>

<style>
	/* The switch - the box around the slider */
	.switch {
		font-size: var(--size, 1em);

		position: relative;
		display: inline-block;
		width: 3.75em;
		height: 2.125em;
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 1.625em;
		width: 1.625em;
		left: 0.25em;
		bottom: 0.25em;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	input:checked + .slider {
		background-color: #2196f3;
	}

	input:focus + .slider {
		box-shadow: 0 0 1px #2196f3;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(1.625em);
		-ms-transform: translateX(1.625em);
		transform: translateX(1.625em);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 2.125em;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
