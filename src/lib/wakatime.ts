import type { GitHubStats, WakaTimeActivityResponse } from './types';

/**
 * Enriches GitHub contribution data with WakaTime daily coding stats using public share JSON data.
 * @param githubStats The calendar object from GitHub
 * @param wakaActivity The JSON data from WakaTime's "Coding Activity" share link
 */
export function enrichWithWakatimeShare(
  githubStats: GitHubStats, 
  wakaActivity: WakaTimeActivityResponse
): GitHubStats {
  if (!githubStats || !wakaActivity || !wakaActivity.days) return githubStats;

  const dailyTextMap: Record<string, string> = {};
  const dailySecondsMap: Record<string, number> = {};

  // Map WakaTime days to lookup tables
  wakaActivity.days.forEach((day) => {
    if (day.date) {
      const totalSeconds = day.total || 0;
      dailySecondsMap[day.date] = totalSeconds;
      
      // Create a human-readable duration string (e.g., "2 hrs 15 mins")
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      let durationText = '';
      if (hours > 0) durationText += `${hours} hr${hours > 1 ? 's' : ''} `;
      if (minutes > 0 || hours === 0) durationText += `${minutes} min${minutes !== 1 ? 's' : ''}`;
      
      dailyTextMap[day.date] = durationText.trim() || '0 mins';
    }
  });

  // Inject data into the GitHub weeks/days structure
  for (const week of githubStats.weeks) {
    for (const day of week.contributionDays) {
      day.codingText = dailyTextMap[day.date] || '0 mins';
      day.codingSeconds = dailySecondsMap[day.date] || 0;
    }
  }

  return githubStats;
}
