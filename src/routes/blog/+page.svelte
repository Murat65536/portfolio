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
        class="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-white/5 bg-surface/30 hover:bg-surface/80 hover:border-white/10 transition-all group overflow-hidden"
      >
        {#if post.image}
          <div class="w-full sm:w-48 h-36 shrink-0 rounded-xl overflow-hidden bg-surface/50 border border-white/5">
            <img 
              src={post.image} 
              alt={post.title} 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        {/if}
        <div class="flex flex-col justify-between grow">
          <div>
            <div class="flex justify-between items-start gap-4 mb-2">
              <h2 class="text-xl font-semibold group-hover:text-primary transition-colors">{post.title}</h2>
              <span class="text-xs text-muted font-mono shrink-0">{post.date}</span>
            </div>
            <p class="text-muted leading-relaxed">{post.description}</p>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
