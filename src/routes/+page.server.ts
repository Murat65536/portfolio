import type { PageServerLoad } from './$types';
import { getGitHubStats, getWakaTimeShareData } from '$lib/server/stats';

export const load: PageServerLoad = async ({ fetch }) => {
  const selectedYear = 'last';

  try {
    const [githubResult, wakaResult] = await Promise.all([
      getGitHubStats(fetch, selectedYear).catch(e => {
        console.error('Failed to fetch GitHub stats during SSR', e);
        return { calendar: null, years: [] };
      }),
      getWakaTimeShareData(fetch).catch(e => {
        console.warn('Failed to fetch WakaTime share data during SSR', e);
        return null;
      })
    ]);

    return {
      githubStats: githubResult.calendar,
      contributionYears: githubResult.years,
      selectedYear,
      wakaTimeRange: wakaResult?.timeRange || 'all-time',
      totalHours: wakaResult?.totalHours || 0,
      wakaTimeLanguages: wakaResult?.languages || [],
      wakaTimeEditors: wakaResult?.editors || [],
      wakaTimeOs: wakaResult?.os || []
    };
  } catch (e) {
    console.error('Critical error during portfolio SSR load', e);
    return {
      githubStats: null,
      contributionYears: [],
      selectedYear,
      wakaTimeRange: 'all-time',
      totalHours: 0,
      wakaTimeLanguages: [],
      wakaTimeEditors: [],
      wakaTimeOs: []
    };
  }
};
