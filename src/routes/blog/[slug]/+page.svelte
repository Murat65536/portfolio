<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const Content = $derived(data.content);
</script>

<svelte:head>
  <title>{data.meta.title} | Portfolio</title>
</svelte:head>

<article class="animate-fade-in max-w-3xl mx-auto">
  <a href="/blog" class="text-muted hover:text-text text-sm mb-8 inline-flex items-center transition-colors">
    ← Back to blog
  </a>

  <header class="mb-10">
    <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{data.meta.title}</h1>
    <div class="flex items-center text-muted text-sm gap-4 mb-6">
      <time>{data.meta.date}</time>
    </div>
    {#if data.meta.image}
      <div class="rounded-2xl overflow-hidden border border-white/10 mb-8 max-h-[420px] bg-surface/50">
        <img src={data.meta.image} alt={data.meta.title} class="w-full h-full object-cover" />
      </div>
    {/if}
  </header>

  <div class="prose">
    <Content />
  </div>
</article>
