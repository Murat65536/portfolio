<script lang="ts">
  import { activityBreakdown, cumulativeActivity, dailyActivity, summarizeActivityRange } from '$lib/activity';
  import type { GitHubStats, WakaTimeCategory, WakaTimeData } from '$lib/types';
  import { onMount } from 'svelte';
  import {
    CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip,
    type ChartData, type ChartDataset, type ChartOptions, type Plugin
  } from 'chart.js';
  import type {} from 'chartjs-plugin-zoom';
  import { Line } from 'svelte-chartjs';

  Tooltip.positioners.fixed = function() {
    return { x: this.chart.chartArea.left, y: this.chart.chartArea.top, xAlign: 'left', yAlign: 'top' };
  };
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Legend, Tooltip);

  let { stats, breakdowns }: { stats: GitHubStats | null; breakdowns: WakaTimeData['breakdowns'] } = $props();
  let chart = $state<ChartJS<'line'> | null>(null);
  let zoomPlugin = $state<Plugin<'line'> | null>(null);
  let codingView = $state<'total' | WakaTimeCategory>('total');
  let valueMode = $state<'cumulative' | 'daily'>('cumulative');
  let visibleRange = $state<[number, number]>([0, Number.MAX_SAFE_INTEGER]);
  let drag = $state<
    { mode: 'select'; start: number; current: number } | { mode: 'pan'; x: number } | null
  >(null);

  onMount(() => {
    void import('chartjs-plugin-zoom').then(({ default: plugin }) => zoomPlugin = plugin);
  });

  const cumulative = $derived(stats ? cumulativeActivity(stats) : []);
  const activity = $derived(stats ? (valueMode === 'cumulative' ? cumulative : dailyActivity(stats)) : []);
  const breakdown = $derived(codingView === 'total' || !breakdowns
    ? []
    : activityBreakdown(activity, breakdowns[codingView], valueMode === 'cumulative'));
  const rangeStats = $derived(summarizeActivityRange(cumulative, ...visibleRange));
  const dateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
  const axisDateFormat = new Intl.DateTimeFormat('en', { month: 'numeric', day: 'numeric', year: '2-digit' });
  const rangeLabel = $derived(rangeStats.from
    ? `${dateFormat.format(new Date(`${rangeStats.from}T00:00:00`))} – ${dateFormat.format(new Date(`${rangeStats.to}T00:00:00`))}`
    : 'No activity');

  function syncRange(source: ChartJS) {
    visibleRange = [Math.ceil(Number(source.scales.x.min)), Math.floor(Number(source.scales.x.max))];
  }

  function pointerX(event: PointerEvent) {
    if (!chart) return 0;
    const x = event.clientX - chart.canvas.getBoundingClientRect().left;
    return Math.max(chart.chartArea.left, Math.min(chart.chartArea.right, x));
  }

  function beginDrag(event: PointerEvent) {
    if (!chart || event.pointerType !== 'mouse' || ![0, 2].includes(event.button)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    (event.currentTarget as HTMLCanvasElement).setPointerCapture(event.pointerId);
    const x = pointerX(event);
    drag = event.button === 0
      ? { mode: 'select', start: x, current: x }
      : { mode: 'pan', x: event.clientX };
  }

  function moveDrag(event: PointerEvent) {
    if (!drag || !chart) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (drag.mode === 'select') drag = { ...drag, current: pointerX(event) };
    else {
      chart.pan({ x: event.clientX - drag.x });
      drag = { mode: 'pan', x: event.clientX };
    }
  }

  function finishDrag(event: PointerEvent) {
    if (!drag || !chart) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const completed = drag;
    drag = null;
    if (completed.mode === 'pan') return syncRange(chart);
    const { start, current } = completed;
    if (Math.abs(start - current) < 5) return;
    chart.zoomRect(
      { x: Math.min(start, current), y: chart.chartArea.top },
      { x: Math.max(start, current), y: chart.chartArea.bottom }
    );
    syncRange(chart);
  }

  const codingDatasets: ChartDataset<'line'>[] = $derived(codingView === 'total'
    ? [{
        label: 'Coding hours', data: activity.map(({ hours }) => hours), yAxisID: 'hours',
        borderColor: '#ef4444', backgroundColor: '#ef444422', fill: true, tension: 0.25
      }]
    : breakdown.map(({ name, color, data }) => ({
        label: name, data, yAxisID: 'hours', stack: 'coding',
        borderColor: color, backgroundColor: `${color}66`, fill: true, tension: 0.25
      })));
  const chartData: ChartData<'line'> = $derived({
    labels: activity.map(({ date }) => axisDateFormat.format(new Date(`${date}T00:00:00`))),
    datasets: [
      ...codingDatasets,
      {
        label: 'Contributions', data: activity.map(({ contributions }) => contributions), yAxisID: 'contributions',
        borderColor: '#3b82f6', backgroundColor: '#3b82f622', fill: true, tension: 0.25
      }
    ]
  });
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    elements: { point: { radius: 0, hitRadius: 12, hoverRadius: 4 } },
    plugins: {
      legend: { labels: { color: '#9ca3af', usePointStyle: true } },
      tooltip: { displayColors: true, position: 'fixed', caretSize: 0 },
      zoom: {
        limits: { x: { min: 'original', max: 'original', minRange: 14 } },
        pan: {
          enabled: true,
          mode: 'x',
          onPanStart: ({ event }) => event.pointerType !== 'mouse',
          onPanComplete: ({ chart }) => syncRange(chart)
        },
        zoom: {
          mode: 'x',
          wheel: { enabled: true },
          pinch: { enabled: true },
          onZoomComplete: ({ chart }) => syncRange(chart)
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', autoSkip: true, maxRotation: 0, maxTicksLimit: 4 }
      },
      hours: { position: 'left', stacked: true, beginAtZero: true, grid: { color: '#ffffff0d' }, ticks: { color: '#ef4444' } },
      contributions: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, ticks: { color: '#3b82f6' } }
    }
  };
</script>

<section class="flex min-h-[32rem] flex-col rounded-xl border border-white/5 bg-surface/50 p-4 sm:p-8">
  <h3 class="mb-6 text-lg font-semibold text-text/90">GitHub activity</h3>

  {#if stats && activity.length}
    <div class="mb-6 grid gap-4 text-center sm:grid-cols-2">
      <p class="rounded-lg border border-white/5 bg-surface/30 p-3">
        <span class="block text-xs uppercase text-muted">Contributions in range</span>
        <strong class="text-xl text-blue-400">{rangeStats.contributions.toLocaleString()}</strong>
      </p>
      <p class="rounded-lg border border-white/5 bg-surface/30 p-3">
        <span class="block text-xs uppercase text-muted">Coding hours in range</span>
        <strong class="text-xl text-red-400">{rangeStats.hours.toLocaleString()}</strong>
      </p>
    </div>
    <div class="mb-2 flex flex-wrap items-center text-xs text-muted" aria-label="Visible graph range">
      <strong class="mr-auto text-text/80">{rangeLabel}</strong>
      <label class="mr-3">
        Values
        <select class="ml-1 rounded border border-white/10 bg-surface px-2 py-1 text-text" bind:value={valueMode}>
          <option value="cumulative">Cumulative</option>
          <option value="daily">Per day</option>
        </select>
      </label>
      {#if breakdowns}
        <label class="mr-3">
          Coding hours
          <select class="ml-1 rounded border border-white/10 bg-surface px-2 py-1 text-text" bind:value={codingView}>
            <option value="total">Total</option>
            <option value="languages">by language</option>
            <option value="editors">by IDE</option>
            <option value="os">by OS</option>
          </select>
        </label>
      {/if}
      <span class="hidden lg:inline">Left-drag a range · Right-drag to pan · Scroll or pinch to zoom</span>
    </div>
    <div class="relative min-h-72 grow">
      {#if zoomPlugin}
        <Line
          bind:chart
          data={chartData}
          options={chartOptions}
          plugins={[zoomPlugin]}
          class="cursor-crosshair"
          role="img"
          aria-label="Interactive coding hours and GitHub contributions"
          onpointerdown={beginDrag}
          onpointermove={moveDrag}
          onpointerup={finishDrag}
          onpointercancel={() => drag = null}
          oncontextmenu={(event) => event.preventDefault()}
          onauxclick={(event) => event.preventDefault()}
        />
        {#if drag?.mode === 'select'}
          <div
            class="pointer-events-none absolute border border-blue-500 bg-blue-500/20"
            style:left={`${Math.min(drag.start, drag.current)}px`}
            style:width={`${Math.abs(drag.current - drag.start)}px`}
            style:top={`${chart?.chartArea.top ?? 0}px`}
            style:height={`${chart ? chart.chartArea.bottom - chart.chartArea.top : 0}px`}
          ></div>
        {/if}
      {/if}
    </div>
  {:else}
    <p class="m-auto text-sm text-muted">GitHub activity is unavailable right now.</p>
  {/if}
</section>
