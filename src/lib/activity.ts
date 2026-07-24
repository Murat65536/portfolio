import type { GitHubStats, WakaTimeBreakdown } from './types';

export function mergeGitHubStats(calendars: GitHubStats[], through = new Date().toISOString().slice(0, 10)): GitHubStats {
  const days = new Map(
    calendars.flatMap(({ weeks }) => weeks.flatMap(({ contributionDays }) => contributionDays))
      .filter(({ date }) => date <= through)
      .map((day) => [day.date, day])
  );
  const sortedDays = [...days.values()].sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalContributions: sortedDays.reduce((total, day) => total + day.contributionCount, 0),
    weeks: Array.from({ length: Math.ceil(sortedDays.length / 7) }, (_, index) => ({
      contributionDays: sortedDays.slice(index * 7, index * 7 + 7)
    }))
  };
}

export function dailyActivity(stats: GitHubStats) {
  return stats.weeks.flatMap(({ contributionDays }) => contributionDays)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({
      date: day.date,
      contributions: day.contributionCount,
      hours: (day.codingSeconds ?? 0) / 3600
    }));
}

export function cumulativeActivity(stats: GitHubStats) {
  let contributions = 0;
  let hours = 0;

  return dailyActivity(stats).map((day) => {
    contributions += day.contributions;
    hours += day.hours;
    return { date: day.date, contributions, hours: Number(hours.toFixed(1)) };
  });
}

export function summarizeActivityRange(activity: ReturnType<typeof cumulativeActivity>, start = 0, end = activity.length - 1) {
  if (!activity.length) return { from: '', to: '', contributions: 0, hours: 0 };
  const from = Math.max(0, Math.min(activity.length - 1, start));
  const to = Math.max(from, Math.min(activity.length - 1, end));
  const previous = activity[from - 1];

  return {
    from: activity[from].date,
    to: activity[to].date,
    contributions: activity[to].contributions - (previous?.contributions ?? 0),
    hours: Number((activity[to].hours - (previous?.hours ?? 0)).toFixed(1))
  };
}

export function activityBreakdown(
  activity: ReturnType<typeof dailyActivity>,
  breakdown: WakaTimeBreakdown,
  cumulative = true
) {
  const days = new Map(breakdown.days.map((day) => [day.date, day.seconds]));
  const totals = breakdown.series.map(() => 0);
  const data = breakdown.series.map(() => [] as number[]);

  for (const { date } of activity) {
    totals.forEach((total, index) => {
      const hours = (days.get(date)?.[index] ?? 0) / 3600;
      totals[index] = cumulative ? total + hours : hours;
      data[index].push(Number(totals[index].toFixed(3)));
    });
  }

  return breakdown.series.map((series, index) => ({ ...series, data: data[index] }));
}
