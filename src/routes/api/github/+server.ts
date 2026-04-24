import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGitHubStats } from '$lib/server/stats';

export const GET: RequestHandler = async ({ url, fetch }) => {
  const yearParam = url.searchParams.get('year') || 'last';

  try {
    const { calendar, years } = await getGitHubStats(fetch, yearParam);
    
    return json({
      calendar,
      years
    });
  } catch (e: any) {
    console.error(`API Error fetching GitHub stats for year ${yearParam}:`, e);
    return json(
      { error: e.message || 'Failed to fetch GitHub stats' }, 
      { status: 500 }
    );
  }
};
