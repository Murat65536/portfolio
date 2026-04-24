<script lang="ts">
  import type { WakaTimeData } from '$lib/types';

  let { stats }: { stats: WakaTimeData } = $props();

  let wakaTab = $state<'languages' | 'editors' | 'os'>('languages');

  let currentList = $derived(wakaTab === 'languages' ? stats.languages : wakaTab === 'editors' ? stats.editors : stats.os);
</script>

<div class="p-8 rounded-xl border border-white/5 bg-surface/50 hover:border-white/10 transition-all flex flex-col h-full">
  <h3 class="text-lg font-semibold mb-6 flex items-center justify-center text-text/90">
    All-Time Coding Stats
  </h3>
  
  <div class="grow flex flex-col justify-center">
    <div class="mb-6 pb-6 border-b border-white/5 flex flex-col items-center justify-center gap-4 text-center">
      <div>
        <div class="text-3xl font-bold text-text mb-1">
          {stats.totalHours.toLocaleString()}
          <span class="text-lg font-normal text-muted ml-2">hrs coded</span>
        </div>
        <div class="text-sm text-muted/70 bg-white/5 px-3 py-1 rounded-full w-fit mx-auto mt-2">
          {stats.timeRange}
        </div>
      </div>
      
      <div class="flex bg-surface/50 rounded-lg p-1 border border-white/5">
          <button 
            class="px-3 py-1 text-sm font-medium rounded-md transition-colors {wakaTab === 'languages' ? 'bg-white/10 text-text' : 'text-muted hover:text-text/80'}"
            onclick={() => wakaTab = 'languages'}
          >Languages</button>
          <button 
            class="px-3 py-1 text-sm font-medium rounded-md transition-colors {wakaTab === 'editors' ? 'bg-white/10 text-text' : 'text-muted hover:text-text/80'}"
            onclick={() => wakaTab = 'editors'}
          >IDEs</button>
          <button 
            class="px-3 py-1 text-sm font-medium rounded-md transition-colors {wakaTab === 'os' ? 'bg-white/10 text-text' : 'text-muted hover:text-text/80'}"
            onclick={() => wakaTab = 'os'}
          >OS</button>
        </div>
      </div>

    <div class="space-y-6">
      {#each Array(5) as _, i}
        {@const item = currentList[i]}
        <div class={item ? "" : "invisible"} aria-hidden={!item}>
          <div class="flex justify-between text-sm mb-2">
            <span class="font-medium flex items-center gap-2">
              <span class="w-3 h-3 rounded-full inline-block" style="background-color: {item?.color || 'transparent'}"></span>
              {item?.name || 'Empty'}
            </span>
            <span class="text-muted">{item?.text || '0 hrs'} ({item?.percent || 0}%)</span>
          </div>
          <div class="w-full bg-background rounded-full h-2 overflow-hidden">
            <div 
              class="h-2 rounded-full transition-all duration-1000 ease-out" 
              style="width: {item?.percent || 0}%; background-color: {item?.color || 'transparent'};"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
