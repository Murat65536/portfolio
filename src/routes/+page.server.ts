import { getGitHubStats, getWakaTimeData } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  const [github, wakaTime] = await Promise.all([
    getGitHubStats(fetch, 'total').catch(() => ({ calendar: null, years: [] })),
    getWakaTimeData(fetch)
  ]);

  return { githubStats: github.calendar, wakaTime };
};
