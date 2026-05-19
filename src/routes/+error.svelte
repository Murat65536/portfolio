<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>{page.status} | Portfolio</title>
</svelte:head>

<section class="min-h-[50vh] flex flex-col justify-center items-start animate-fade-in max-w-2xl">
  <p class="text-primary font-mono text-sm mb-2">Error {page.status}</p>
  <h1 class="text-3xl md:text-5xl font-bold tracking-tight mb-4">
    {page.status === 404 ? 'Page not found' : 'Something went wrong'}
  </h1>
  <p class="text-lg text-muted mb-8">
    {page.error?.message ?? 'An unexpected error occurred.'}
  </p>
  <a href="/" class="px-6 py-3 bg-text text-background rounded-lg font-medium hover:bg-white/90 transition-colors">
    Back home
  </a>
</section>
