<script lang="ts">
  import type { PageData } from './$types';
  import GithubActivity from '$lib/components/GithubActivity.svelte';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Murat Bayraktar — Portfolio</title></svelte:head>

<section class="flex min-h-[60vh] flex-col items-start justify-center animate-fade-in">
  <h1 class="mb-3 text-3xl font-bold tracking-tight md:text-5xl">Hey! I'm Murat</h1>
  <p class="mb-10 max-w-2xl text-xl leading-relaxed text-muted">I'm a high school student and open-source contributor</p>
  <div class="flex gap-4">
    <a href="/blog" class="rounded-lg bg-text px-6 py-3 font-medium text-background hover:bg-white/90">View Blog</a>
    <a href="https://github.com/Murat65536" class="rounded-lg border border-white/10 p-3 hover:bg-white/5" aria-label="GitHub">
      <img src="/icons/github.svg" alt="" class="h-6 w-6 invert" />
    </a>
  </div>
</section>

<section class="mb-12 mt-24">
  <h2 class="mb-8 text-2xl font-bold">Stats &amp; contributions</h2>
  <GithubActivity stats={data.githubStats} breakdowns={data.wakaTime.breakdowns} />
</section>
