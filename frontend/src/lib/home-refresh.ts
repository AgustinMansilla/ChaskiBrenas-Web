export const homePageSize = 12;
export const homeRefreshDelay = 5 * 60 * 1000;
export const homeReturnKey = "chaski-return-to-latest";
export function homeRefreshDue(lastRequestAt: number, now: number) { return now - lastRequestAt >= homeRefreshDelay; }
