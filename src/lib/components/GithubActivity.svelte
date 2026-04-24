<script lang="ts">
  import type { GitHubStats, ContributionDay } from '$lib/types';
  import { getDayColor } from '$lib/utils';

  let { 
    githubStats, 
    contributionYears, 
    selectedYear = $bindable(), 
    loadingGithub, 
    onYearChange 
  }: { 
    githubStats: GitHubStats | null, 
    contributionYears: number[], 
    selectedYear: string, 
    loadingGithub: boolean, 
    onYearChange: (year: string) => Promise<void> 
  } = $props();

  let githubTab = $state<'contributions' | 'hours' | 'blended'>('blended');

  let hoveredDay = $state<ContributionDay | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formattedWeeks = $derived(githubStats?.weeks.map((week) => {
    const firstDayOfMonth = week.contributionDays.find(d => d.date.endsWith('-01'));
    const monthIndex = firstDayOfMonth 
      ? new Date(firstDayOfMonth.date).getMonth() 
      : new Date(week.contributionDays[0].date).getMonth();
    const showLabel = !!firstDayOfMonth;
    
    return {
      ...week,
      monthIndex,
      showLabel
    };
  }) || []);

  function setHoveredDay(day: ContributionDay | null) {
    hoveredDay = day;
  }

  function setTab(tab: string) {
    githubTab = tab as 'contributions' | 'hours' | 'blended';
  }
</script>

<div class="p-8 rounded-xl border border-white/5 bg-surface/50 hover:border-white/10 transition-all flex flex-col h-full">
  <h3 class="text-lg font-semibold mb-6 flex items-center justify-center text-text/90">
    GitHub Activity
  </h3>

  <div class="mb-4 flex flex-col items-center gap-3 text-center">
    <div class="flex items-center gap-2 flex-wrap justify-center">
      {#if githubStats}
        <span class="text-text/90 font-medium pointer-events-none">
          {githubStats.totalContributions} contributions in
        </span>
      {/if}
      <select 
        class="bg-surface/50 border border-white/10 text-sm rounded-md px-2 py-1 outline-none focus:border-primary transition-colors cursor-pointer text-text/90"
        bind:value={selectedYear}
        onchange={(e) => onYearChange(e.currentTarget.value)}
        disabled={loadingGithub}
      >
        <option value="last">the last year</option>
        {#each contributionYears as year}
          <option value={year.toString()}>{year}</option>
        {/each}
      </select>
    </div>
    
    {#if githubStats}
      <div class="flex bg-surface/50 rounded-lg p-1 border border-white/5 pointer-events-auto">
        {#each ['contributions', 'hours', 'blended'] as tab}
          <button 
            class="px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors {githubTab === tab ? 'bg-white/10 text-text' : 'text-muted hover:text-text/80'}"
            onclick={() => setTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="grow flex flex-col justify-center">
    {#if loadingGithub}
      <div class="flex justify-center items-center h-32">
        <div class="animate-pulse flex gap-2">
          <div class="w-2 h-2 rounded-full bg-primary/50"></div>
          <div class="w-2 h-2 rounded-full bg-primary/70 delay-100"></div>
          <div class="w-2 h-2 rounded-full bg-primary delay-200"></div>
        </div>
      </div>
    {:else if githubStats}
      <div class="h-10 flex items-center justify-center text-sm mb-2 text-text/80">
        {#if hoveredDay}
          <span class="animate-in fade-in duration-200 flex items-center gap-1.5">
            <span class="font-bold text-text">{hoveredDay.contributionCount}</span> contributions 
            {#if hoveredDay.codingText}
              & <span class="font-bold text-text">{hoveredDay.codingText}</span> coded
            {/if}
            on <span class="text-muted">{hoveredDay.date}</span>
          </span>
        {:else}
          <span class="text-muted/50 italic">Hover over the chart for details</span>
        {/if}
      </div>

      <div class="flex overflow-x-auto pb-10 pt-4 relative z-10 custom-scrollbar">
        {#each formattedWeeks as week}
          <div class="flex flex-col items-center">
            <div class="h-35 flex flex-col">
              {#each week.contributionDays as day}
                {@const isEmpty = githubTab === 'hours' ? !day.codingSeconds : githubTab === 'contributions' ? day.contributionCount === 0 : (!day.codingSeconds && day.contributionCount === 0)}
                <button 
                  class="w-5 h-5 rounded-sm shrink-0 cursor-pointer border transition-all border-surface/50 {isEmpty ? 'bg-white/5' : ''}"
                  style={getDayColor(day, githubTab)}
                  onmouseenter={() => setHoveredDay(day)}
                  onmouseleave={() => setHoveredDay(null)}
                  onfocus={() => setHoveredDay(day)}
                  onblur={() => setHoveredDay(null)}
                  aria-label="{day.contributionCount} contributions on {day.date}"
                ></button>
              {/each}
            </div>

            <div class="h-8 flex items-start justify-center mt-2">
              {#if week.showLabel}
                <span class="text-[9px] font-bold text-text/80 uppercase tracking-tighter [writing-mode:vertical-lr]">
                  {monthNames[week.monthIndex]}
                </span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center text-muted text-sm py-8">
        Failed to load GitHub stats.
      </div>
    {/if}
  </div>
</div>
