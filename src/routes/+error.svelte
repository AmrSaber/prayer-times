<script lang="ts">
  import { goto } from '$app/navigation';

  // If user tries to view any non-existent page, navigate to home
  goto('/');
</script>
