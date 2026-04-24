import type { ContributionDay } from './types';

/**
 * Calculates the color for a contribution day based on commit count and coding time.
 * @param day The contribution day data
 * @param mode The current display mode ('contributions', 'hours', or 'blended')
 */
export function getDayColor(day: ContributionDay, mode: 'contributions' | 'hours' | 'blended') {
  const redIntensity = day.codingSeconds ? Math.min(1, day.codingSeconds / 28800) : 0;
  const blueIntensity = day.contributionCount > 0 ? Math.min(1, day.contributionCount / 10) : 0;
  
  if (mode === 'hours') {
    if (redIntensity === 0) return '';
    return `background-color: rgba(239, 68, 68, ${Math.min(1, 0.3 + redIntensity * 0.7)})`;
  }
  
  if (mode === 'contributions') {
    if (blueIntensity === 0) return '';
    return `background-color: rgba(59, 130, 246, ${Math.min(1, 0.3 + blueIntensity * 0.7)})`;
  }

  if (redIntensity === 0 && blueIntensity === 0) return '';

  const total = redIntensity + blueIntensity;
  const rRatio = redIntensity / total;
  const bRatio = blueIntensity / total;
  
  const r = Math.round(rRatio * 239 + bRatio * 59);
  const g = Math.round(rRatio * 68 + bRatio * 130);
  const b = Math.round(rRatio * 68 + bRatio * 246);
  
  const opacity = Math.min(1, 0.3 + Math.max(redIntensity, blueIntensity) * 0.7);
  
  return `background-color: rgba(${r}, ${g}, ${b}, ${opacity})`;
}
