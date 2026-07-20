<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Blog | Portfolio</title>
</svelte:head>

<div class="animate-fade-in">
  <h1 class="text-4xl font-bold mb-8">Blog</h1>
  
  <div class="grid gap-6">
    {#each data.posts as post}
      <a 
        href={`/blog/${post.slug}`} 
        class="block p-6 rounded-2xl border border-white/5 bg-surface/30 hover:bg-surface/80 hover:border-white/10 transition-all group"
      >
        <div class="flex justify-between items-start mb-2">
          <h2 class="text-xl font-semibold group-hover:text-primary transition-colors">{post.title}</h2>
          <span class="text-xs text-muted font-mono">{post.date}</span>
        </div>
        <p class="text-muted">{post.description}</p>
      </a>
    {/each}
  </div>
</div>
