<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Projects | Portfolio</title>
</svelte:head>

<div class="animate-fade-in">
  <h1 class="text-4xl font-bold mb-8">Projects</h1>
  
  <div class="grid gap-6">
    {#each data.projects as project}
      <a 
        href={`/projects/${project.slug}`} 
        class="block p-6 rounded-2xl border border-white/5 bg-surface/30 hover:bg-surface/80 hover:border-white/10 transition-all group"
      >
        <div class="flex justify-between items-start mb-2">
          <h2 class="text-xl font-semibold group-hover:text-primary transition-colors">{project.title}</h2>
          <span class="text-xs text-muted font-mono">{project.date}</span>
        </div>
        <p class="text-muted">{project.description}</p>
      </a>
    {/each}
  </div>
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
</style>