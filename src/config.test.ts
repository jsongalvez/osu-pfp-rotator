import { expect, test } from "vitest";
import { loadConfig } from "./config.js";

test("loads config from fixture env", () => {
  const config = loadConfig(".env.test");
  expect(config.sessionCookieName).toBe("osu_session");
  expect(config.pool).toEqual([
    "https://a.s-ul.eu/x.png",
    "https://b.s-ul.eu/y.png",
  ]);
  expect(config.rotationHour).toBe(4);
  expect(config.timezoneOffset).toBe(8);
});
