export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const thirtyDaysFromNow = (): Date =>
  new Date(Date.now() + 30 * ONE_DAY_IN_MS);

export const fortyFiveMinutesFromNow = (): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 45);
  return now;
};
export const tenMinutesAgo = (): Date => new Date(Date.now() - 10 * 60 * 1000);

export const threeMinutesAgo = (): Date => new Date(Date.now() - 3 * 60 * 1000);

export const anHourFromNow = (): Date => new Date(Date.now() + 60 * 60 * 1000);

export const calculateExpirationDate = (expiresIn: string = "15m"): Date => {
  // Match number + unit (m = minutes, h = hours, d = days)
  const match = expiresIn.match(/^(\d+)([mhd])$/);
  if (!match) throw new Error('Invalid format. Use "15m", "1h", or "2d".');
  const [, value, unit] = match;

  // Check the unit and apply accordingly
  switch (unit) {
    case "m": // minutes
      return new Date(Date.now() + parseInt(value) * 60 * 1000);
    case "h": // hours
      return new Date(Date.now() + parseInt(value) * 60 * 60 * 1000);
    case "d": // days
      return new Date(Date.now() + parseInt(value) * ONE_DAY_IN_MS);
    default:
      throw new Error('Invalid unit. Use "m", "h", or "d".');
  }
};
