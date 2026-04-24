import { env } from '$env/dynamic/private';
import { CONFIG } from '$lib/config';
import type {
  GitHubGraphQLResponse,
  WakaTimeActivityResponse,
  WakaTimeShareResponse,
  WakaTimeItem
} from '$lib/types';
import { enrichWithWakatimeShare } from '$lib/wakatime';

const GITHUB_QUERY = `
  query($userName:String!, $from: DateTime, $to: DateTime) {
    user(login: $userName){
      contributionsCollection(from: $from, to: $to) {
        contributionYears
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              color
            }
          }
        }
      }
    }
  }
`;

// Simple in-memory cache for WakaTime activity data
let wakaActivityCache: { data: WakaTimeActivityResponse, timestamp: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function fetchWakaTimeActivity(fetchFn: typeof fetch): Promise<WakaTimeActivityResponse | null> {
  const now = Date.now();
  if (wakaActivityCache && (now - wakaActivityCache.timestamp < CACHE_TTL)) {
    return wakaActivityCache.data;
  }

  try {
    const res = await fetchFn(`https://wakatime.com/share/@${CONFIG.GITHUB_USERNAME}/${CONFIG.WAKATIME_SHARE_IDS.activity}.json`);
    if (res.ok) {
      const data = await res.json() as WakaTimeActivityResponse;
      wakaActivityCache = { data, timestamp: now };
      return data;
    }
  } catch (e) {
    console.error('Failed to fetch WakaTime activity', e);
  }
  return null;
}

export async function getGitHubStats(fetchFn: typeof fetch, year?: string) {
  const token = env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not configured');

  let from = undefined;
  let to = undefined;
  if (year && year !== 'last') {
    from = `${year}-01-01T00:00:00Z`;
    to = `${year}-12-31T23:59:59Z`;
  }

  const [githubRes, wakaActivity] = await Promise.all([
    fetchFn('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GITHUB_QUERY,
        variables: { userName: CONFIG.GITHUB_USERNAME, from, to },
      }),
    }),
    fetchWakaTimeActivity(fetchFn)
  ]);

  if (!githubRes.ok) throw new Error('GitHub API responded with error');

  const json = await githubRes.json() as GitHubGraphQLResponse;
  const collection = json.data?.user?.contributionsCollection;
  let calendar = collection?.contributionCalendar || null;

  if (calendar && wakaActivity) {
    calendar = enrichWithWakatimeShare(calendar, wakaActivity);
  }

  return {
    calendar,
    years: collection?.contributionYears || [],
    wakaActivity
  };
}

export async function getWakaTimeShareData(fetchFn: typeof fetch) {
  try {
    const activityData = await fetchWakaTimeActivity(fetchFn);
    
    const [langRes, editRes, osRes] = await Promise.all([
      fetchFn(`https://wakatime.com/share/@${CONFIG.GITHUB_USERNAME}/${CONFIG.WAKATIME_SHARE_IDS.languages}.json`),
      fetchFn(`https://wakatime.com/share/@${CONFIG.GITHUB_USERNAME}/${CONFIG.WAKATIME_SHARE_IDS.editors}.json`),
      fetchFn(`https://wakatime.com/share/@${CONFIG.GITHUB_USERNAME}/${CONFIG.WAKATIME_SHARE_IDS.os}.json`)
    ]);

    const totalSeconds = (activityData?.days || []).reduce((acc, day) => acc + (day.total || 0), 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const timeRange = activityData?.human_readable_range || 'all-time';

    const processItems = async (res: Response): Promise<WakaTimeItem[]> => {
      if (!res.ok) return [];
      const json = await res.json() as WakaTimeShareResponse;
      return json.data.slice(0, 5).map(item => ({
        ...item,
        text: `${Math.floor(totalHours * (item.percent / 100))} hrs`
      }));
    };

    return {
      languages: await processItems(langRes),
      editors: await processItems(editRes),
      os: await processItems(osRes),
      totalHours,
      timeRange
    };
  } catch (e) {
    console.error('Failed to fetch WakaTime share data', e);
    return null;
  }
}
