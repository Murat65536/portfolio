export interface WakaTimeItem {
  name: string;
  percent: number;
  color: string;
}

export interface WakaTimeData {
  breakdowns: Record<WakaTimeCategory, WakaTimeBreakdown> | null;
}

export type WakaTimeCategory = 'languages' | 'editors' | 'os';

export interface WakaTimeBreakdown {
  series: Pick<WakaTimeItem, 'name' | 'color'>[];
  days: { date: string; seconds: number[] }[];
}

export interface WakaTimeDay {
  date: string;
  total: number;
}

export interface WakaTimeShareResponse {
  data: WakaTimeItem[];
}

export interface WakaTimeActivityResponse {
  human_readable_range: string;
  days: WakaTimeDay[];
}

export interface WakaTimeSummariesResponse {
  data: {
    grand_total: { total_seconds: number };
    languages: { name: string; total_seconds: number }[];
    editors: { name: string; total_seconds: number }[];
    operating_systems: { name: string; total_seconds: number }[];
    range: { date: string };
  }[];
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
  codingSeconds?: number;
}

export interface GitHubStats {
  totalContributions: number;
  weeks: {
    contributionDays: ContributionDay[];
  }[];
}

export interface GitHubGraphQLResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionYears: number[];
        contributionCalendar: GitHubStats;
      };
    };
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  image?: string;
}

