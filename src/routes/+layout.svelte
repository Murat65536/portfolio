<script lang="ts">
  import '@fontsource/jetbrains-mono/400.css';
  import '@fontsource/jetbrains-mono/700.css';
  import '../app.css';
  import { page } from '$app/state';

  let { children } = $props();

  let scrollProgress = $state(0);
  let isScrolling = $state(false);
  let isScrolled = $state(false);
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollHeight > 0) {
        scrollProgress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      } else {
        scrollProgress = 0;
      }

      isScrolled = scrollTop > 10;
      isScrolling = true;

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  });
</script>

<div class="min-h-screen flex flex-col bg-background selection:bg-primary/30">
  <header class="border-b border-white/5 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="/" class="text-xl font-bold tracking-tight hover:text-primary transition-colors flex items-center gap-1">
        <span class="text-primary">~</span>/
        {#if page.url.pathname.startsWith('/blog')}
          Blog
        {/if}
      </a>
      <nav class="flex gap-6 text-sm font-medium text-muted items-center">
        <a href="/" class="hover:text-text transition-colors">Home</a>
        <a href="/blog" class="hover:text-text transition-colors">Blog</a>
      </nav>
    </div>

    <div 
      class="absolute bottom-0 left-0 right-0 h-1 bg-white/10 pointer-events-none transition-opacity duration-300 {isScrolled && isScrolling ? 'opacity-50' : 'opacity-0'}"
    >
      <div 
        class="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-75 ease-out"
        style="width: {scrollProgress}%"
      ></div>
    </div>
  </header>

  <main class="grow max-w-6xl w-full mx-auto px-4 py-12">
    {@render children()}
  </main>

  <footer class="border-t border-white/5 py-8 mt-12 text-center text-muted text-sm">
    <p>© {new Date().getFullYear()} Murat Bayraktar</p>
  </footer>
</div>