import { env } from '$env/dynamic/private';
import { mergeGitHubStats } from '$lib/activity';
import { CONFIG } from '$lib/config';
import type {
  GitHubGraphQLResponse, GitHubStats, WakaTimeActivityResponse, WakaTimeCategory, WakaTimeData,
  WakaTimeDay, WakaTimeItem, WakaTimeShareResponse, WakaTimeSummariesResponse
} from '$lib/types';

const GITHUB_QUERY = `
  query($userName: String!, $from: DateTime, $to: DateTime) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        contributionYears
        contributionCalendar {
          totalContributions
          weeks { contributionDays { contributionCount date color } }
        }
      }
    }
  }
`;
const TTL = 15 * 60 * 1000;
const cache = new Map<string, { data: unknown; expires: number }>();
const emptyWakaTime: WakaTimeData = { breakdowns: null };

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data as T;
  const data = await load();
  cache.set(key, { data, expires: Date.now() + TTL });
  return data;
}

async function getWakaTimeActivity(fetchFn: typeof fetch) {
  return cached<WakaTimeActivityResponse | null>('waka:activity', async () => {
    try {
      const response = await fetchFn(`https://wakatime.com/share/@${CONFIG.GITHUB_USERNAME}/${CONFIG.WAKATIME_SHARE_IDS.activity}.json`);
      return response.ok ? response.json() as Promise<WakaTimeActivityResponse> : null;
    } catch {
      return null;
    }
  });
}

async function getWakaTimeBreakdowns(fetchFn: typeof fetch, days: WakaTimeDay[], lists: WakaTimeItem[][]) {
  if (!env.WAKATIME_API_KEY || !days.length) return null;

  return cached('waka:breakdowns', async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const years = [...new Set(days.map(({ date }) => date.slice(0, 4)))];
      const responses = await Promise.all(years.map((year) => fetchFn(
        `https://wakatime.com/api/v1/users/current/summaries?start=${year}-01-01&end=${year === today.slice(0, 4) ? today : `${year}-12-31`}`,
        { headers: { Authorization: `Basic ${btoa(env.WAKATIME_API_KEY)}` } }
      )));
      if (responses.some(({ ok }) => !ok)) return null;

      const summaries = (await Promise.all(responses.map((response) =>
        response.json() as Promise<WakaTimeSummariesResponse>
      ))).flatMap(({ data }) => data);
      const fields = { languages: 'languages', editors: 'editors', os: 'operating_systems' } as const;

      return Object.fromEntries((Object.keys(fields) as WakaTimeCategory[]).map((category, listIndex) => {
        const top = lists[listIndex].filter(({ name }) => name !== 'Other').slice(0, 3);
        const categoryDays = summaries.map((day) => {
          const seconds = top.map(({ name }) =>
            day[fields[category]].find((item) => item.name === name)?.total_seconds ?? 0
          );
          return {
            date: day.range.date,
            seconds: [...seconds, Math.max(0, day.grand_total.total_seconds - seconds.reduce((a, b) => a + b, 0))]
          };
        });
        const hasOther = categoryDays.some(({ seconds }) => seconds.at(-1));

        return [category, {
          series: [...top.map(({ name, color }) => ({ name, color })), ...(hasOther ? [{ name: 'Other', color: '#6b7280' }] : [])],
          days: hasOther ? categoryDays : categoryDays.map(({ date, seconds }) => ({ date, seconds: seconds.slice(0, -1) }))
        }];
      })) as WakaTimeData['breakdowns'];
    } catch {
      return null;
    }
  });
}

export async function getGitHubStats(fetchFn: typeof fetch, range = 'last'): Promise<{
  calendar: GitHubStats | null;
  years: number[];
}> {
  const safeRange = range === 'total' || /^\d{4}$/.test(range) ? range : 'last';

  return cached(`github:${safeRange}`, async () => {
    if (safeRange === 'total') {
      const { years } = await getGitHubStats(fetchFn);
      const calendars = await Promise.all(years.map(async (year) =>
        (await getGitHubStats(fetchFn, String(year))).calendar
      ));
      return { calendar: mergeGitHubStats(calendars.filter((item): item is GitHubStats => item !== null)), years };
    }

    if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not configured');
    const year = safeRange === 'last' ? undefined : safeRange;
    const [response, wakaTime] = await Promise.all([
      fetchFn('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `bearer ${env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GITHUB_QUERY,
          variables: {
            userName: CONFIG.GITHUB_USERNAME,
            from: year ? `${year}-01-01T00:00:00Z` : undefined,
            to: year ? `${year}-12-31T23:59:59Z` : undefined
          }
        })
      }),
      getWakaTimeActivity(fetchFn)
    ]);
    if (!response.ok) throw new Error('GitHub API request failed');

    const collection = ((await response.json()) as GitHubGraphQLResponse).data?.user?.contributionsCollection;
    const calendar = collection?.contributionCalendar ?? null;
    const codingByDate = new Map(wakaTime?.days.map((day) => [day.date, day.total]) ?? []);

    for (const week of calendar?.weeks ?? []) {
      for (const day of week.contributionDays) day.codingSeconds = codingByDate.get(day.date) ?? 0;
    }

    return { calendar, years: collection?.contributionYears ?? [] };
  });
}

export async function getWakaTimeData(fetchFn: typeof fetch): Promise<WakaTimeData> {
  return cached('waka:shares', async () => {
    try {
      const activity = await getWakaTimeActivity(fetchFn);
      const categories = ['languages', 'editors', 'os'] as const;
      const responses = await Promise.all(categories.map((category) =>
        fetchFn(`https://wakatime.com/share/@${CONFIG.GITHUB_USERNAME}/${CONFIG.WAKATIME_SHARE_IDS[category]}.json`)
      ));
      const lists = await Promise.all(responses.map(async (response) => {
        if (!response.ok) return [];
        const { data } = await response.json() as WakaTimeShareResponse;
        return data;
      }));
      const breakdowns = await getWakaTimeBreakdowns(fetchFn, activity?.days ?? [], lists);

      return { breakdowns };
    } catch {
      return emptyWakaTime;
    }
  });
}
