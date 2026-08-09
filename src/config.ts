import { loadEnvFile } from "node:process";

export interface Config {
  sessionCookieName: string;
  sessionCookieValue: string;
  xsrfToken: string;
  pool: string[];
  rotationHour: number;
  timezoneOffset: number;
}

export function loadConfig(envPath = ".env"): Config {
  loadEnvFile(envPath);

  const name = requireEnv("OSU_SESSION_COOKIE_NAME");
  const value = requireEnv("OSU_SESSION_COOKIE_VALUE");
  const token = requireEnv("XSRF_TOKEN");
  const poolRaw = requireEnv("IMAGE_POOL");
  const rotationHour = requireEnv("ROTATION_HOUR");
  const timezoneOffset = requireEnv("TIMEZONE_OFFSET");

  function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing ${key} in ${envPath}`);
    return value;
  }

  const poolUrlRegex = /^https:\/\/[^/]+\.s-ul\.eu\/.+/;

  function parsePool(poolRaw: string): string[] {
    return poolRaw
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url !== "")
      .map((url) => {
        if (!poolUrlRegex.test(url))
          throw new Error(`Invalid pool URL ${url} in ${envPath}`);
        return url;
      });
  }

  function parseRotationHour(hourRaw: number): number {
    if (!(hourRaw >= 0 && hourRaw <= 23))
      throw new Error(`Invalid rotation hour, must be between 0 and 23`);
    return hourRaw;
  }

  function parseTimezoneOffset(offsetRaw: number) {
    if (!(offsetRaw >= -12 && offsetRaw <= 14))
      throw new Error(`Invalid timezone offset, must be between -12 to 14`);
    return offsetRaw;
  }

  return {
    sessionCookieName: name,
    sessionCookieValue: value,
    xsrfToken: token,
    pool: parsePool(poolRaw),
    rotationHour: parseRotationHour(Number(rotationHour)),
    timezoneOffset: parseTimezoneOffset(Number(timezoneOffset)),
  };
}
