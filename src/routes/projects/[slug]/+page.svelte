<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const Content = $derived(data.content);
</script>

<svelte:head>
  <title>{data.meta.title} | Portfolio</title>
</svelte:head>

<article class="animate-fade-in max-w-3xl mx-auto">
  <a href="/projects" class="text-muted hover:text-text text-sm mb-8 inline-flex items-center transition-colors">
    Back to projects
  </a>

  <header class="mb-10">
    <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{data.meta.title}</h1>
    <div class="flex items-center text-muted text-sm gap-4">
      <time>{data.meta.date}</time>
    </div>
  </header>

  <div class="prose">
    <Content />
  </div>
</article>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
</style>