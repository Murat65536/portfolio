<script lang="ts">
  import type {PageData} from './$types';
  import type {GitHubStats, WakaTimeData} from '$lib/types';
  import Main from '$lib/components/Main.svelte';
  import WakatimeStats from '$lib/components/WakatimeStats.svelte';
  import GithubActivity from '$lib/components/GithubActivity.svelte';

  let { data }: { data: PageData } = $props();

  // GitHub Stats State
  // svelte-ignore state_referenced_locally
  let selectedYear = $state<string>(data.selectedYear);
  let loadingGithub = $state(false);

  // Sync selectedYear with data.selectedYear when data changes
  $effect(() => {
    selectedYear = data.selectedYear;
  });

  // Client-side cache for GitHub stats (using a reactive object)
  const githubCache = $state<Record<string, { calendar: GitHubStats, years: number[] }>>({});

  // Sync initial data into cache
  $effect(() => {
    if (data.githubStats && !githubCache[data.selectedYear]) {
      githubCache[data.selectedYear] = { 
        calendar: data.githubStats, 
        years: data.contributionYears || [] 
      };
    }
  });

  // Current stats are derived from the selected year and cache
  const githubStats = $derived(githubCache[selectedYear]?.calendar || (selectedYear === data.selectedYear ? data.githubStats : null));
  const contributionYears = $derived(githubCache[selectedYear]?.years || (selectedYear === data.selectedYear ? data.contributionYears : []) || []);

  // WakaTime Stats State (already in correct format from server)
  const wakaTimeData: WakaTimeData = $derived({
    languages: data.wakaTimeLanguages || [],
    editors: data.wakaTimeEditors || [],
    os: data.wakaTimeOs || [],
    totalHours: data.totalHours || 0,
    timeRange: data.wakaTimeRange || 'all-time'
  });

  // Fetch GitHub data purely on the client
  const fetchGithubStats = async (year: string) => {
    selectedYear = year;
    
    // Use cache if available
    if (githubCache[year]) return;

    loadingGithub = true;
    try {
      const res = await fetch(`/api/github?year=${year}`);
      if (res.ok) {
        githubCache[year] = await res.json();
      }
    } catch (e) {
      console.error('Failed to fetch GitHub stats', e);
    } finally {
      loadingGithub = false;
    }
  };

  // Prefetch recent years in the background
  $effect(() => {
    if (contributionYears.length > 0) {
      const yearsToPrefetch = contributionYears.map(y => y.toString()).filter(y => !githubCache[y]);
      
      const runPrefetch = async () => {
        for (const year of yearsToPrefetch) {
          if (githubCache[year]) continue;
          
          try {
            const res = await fetch(`/api/github?year=${year}`);
            if (res.ok) {
              githubCache[year] = await res.json();
            }
          } catch (e) {
            console.warn(`Background prefetch failed for year ${year}`, e);
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      };

      runPrefetch();
    }
  });
</script>

<svelte:head>
  <title>Home | Portfolio</title>
</svelte:head>

<Main />

<section class="mt-24 mb-12">
  <h2 class="text-2xl font-bold mb-8 flex items-center">
    <span class="w-8 h-0.5 bg-primary mr-4 inline-block"></span>
    Stats & Contributions
  </h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <WakatimeStats stats={wakaTimeData} />
    
    <GithubActivity 
      {githubStats}
      {contributionYears}
      bind:selectedYear={selectedYear}
      {loadingGithub}
      onYearChange={fetchGithubStats}
    />
  </div>
</section>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
