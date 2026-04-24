export interface WakaTimeItem {
  name: string;
  percent: number;
  color: string;
  text: string;
}

export interface WakaTimeData {
  languages: WakaTimeItem[];
  editors: WakaTimeItem[];
  os: WakaTimeItem[];
  totalHours: number;
  timeRange: string;
}

export interface WakaTimeDay {
  date: string;
  total: number;
}

export interface WakaTimeShareResponse {
  data: (Omit<WakaTimeItem, 'text'>)[];
}

export interface WakaTimeActivityResponse {
  human_readable_range: string;
  days: WakaTimeDay[];
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
  codingText?: string;
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

export interface Project {
  slug: string;
  title: string;
  description: string;
  date: string;
}
