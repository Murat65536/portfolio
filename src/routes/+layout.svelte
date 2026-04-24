<script lang="ts">
  import '@fontsource/jetbrains-mono/400.css';
  import '@fontsource/jetbrains-mono/700.css';
  import '../app.css';
  import { page } from '$app/state';

  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-background selection:bg-primary/30">
  <header class="border-b border-white/5 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="/" class="text-xl font-bold tracking-tight hover:text-primary transition-colors flex items-center gap-1">
        <span class="text-primary">~</span>/
        {#if page.url.pathname.startsWith('/projects')}
          Projects
        {/if}
      </a>
      <nav class="flex gap-6 text-sm font-medium text-muted items-center">
        <a href="/" class="hover:text-text transition-colors">Home</a>
        <a href="/projects" class="hover:text-text transition-colors">Projects</a>
      </nav>
    </div>
  </header>

  <main class="grow max-w-6xl w-full mx-auto px-4 py-12">
    {@render children()}
  </main>

  <footer class="border-t border-white/5 py-8 mt-12 text-center text-muted text-sm">
    <p>© {new Date().getFullYear()} Murat Bayraktar</p>
  </footer>
</div>